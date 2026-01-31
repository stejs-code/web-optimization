import type { BundleData, ModuleData } from "../types.ts";
import { extractModuleName, isNodeModule } from "../utils.ts";

/**
 * webpack-bundle-analyzer JSON format
 */
interface WebpackGroup {
  label: string;
  path?: string;
  id?: number;
  statSize?: number;
  parsedSize?: number;
  gzipSize?: number;
  groups?: WebpackGroup[];
}

interface WebpackChunk {
  label: string;
  isAsset?: boolean;
  statSize?: number;
  parsedSize?: number;
  gzipSize?: number;
  groups?: WebpackGroup[];
}

/**
 * Parse webpack-bundle-analyzer JSON output
 */
export async function parseNextjsStats(
  projectName: string,
  statsFilePath: string
): Promise<BundleData> {
  const statsFile = Bun.file(statsFilePath);

  if (!(await statsFile.exists())) {
    throw new Error(
      `Stats file not found: ${statsFilePath}\n` +
        `Make sure webpack-bundle-analyzer is configured correctly in your Next.js config.`
    );
  }

  const stats = (await statsFile.json()) as WebpackChunk[];

  if (!Array.isArray(stats)) {
    throw new Error(
      `Invalid stats file format: ${statsFilePath}\n` +
        `Expected webpack-bundle-analyzer JSON output (array of chunks).`
    );
  }

  const modules: ModuleData[] = [];
  const chunkSizes = new Map<string, number>();
  let totalSize = 0;

  // Recursively extract modules from groups
  function extractModules(
    group: WebpackGroup,
    chunkName: string,
    pathParts: string[] = []
  ) {
    const currentPath = group.path || [...pathParts, group.label].join("/");

    // If this group has an id and size, it's a leaf module
    if (group.id !== undefined && group.parsedSize !== undefined) {
      modules.push({
        project: projectName,
        projectType: "nextjs",
        chunk: chunkName,
        module: currentPath,
        moduleName: extractModuleName(currentPath),
        isNodeModule: isNodeModule(currentPath),
        sizeRaw: group.parsedSize,
        sizeGzip: group.gzipSize || 0,
        sizeBrotli: 0, // Not provided by webpack-bundle-analyzer
        percentOfChunk: 0, // Will be calculated later
        percentOfProject: 0, // Will be calculated later
      });
    }

    // Recurse into child groups
    if (group.groups) {
      for (const childGroup of group.groups) {
        extractModules(childGroup, chunkName, [...pathParts, group.label]);
      }
    }
  }

  // Process each chunk
  for (const chunk of stats) {
    const chunkName = chunk.label;
    const chunkSize = chunk.parsedSize || 0;

    chunkSizes.set(chunkName, chunkSize);
    totalSize += chunkSize;

    // Extract modules from chunk groups
    if (chunk.groups) {
      for (const group of chunk.groups) {
        extractModules(group, chunkName);
      }
    }
  }

  // Calculate percentages
  for (const module of modules) {
    const chunkSize = chunkSizes.get(module.chunk) || 1;
    module.percentOfChunk = (module.sizeRaw / chunkSize) * 100;
    module.percentOfProject = totalSize > 0 ? (module.sizeRaw / totalSize) * 100 : 0;
  }

  return {
    projectName,
    projectType: "nextjs",
    totalSize,
    modules,
  };
}
