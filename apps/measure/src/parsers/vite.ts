import type { BundleData, ModuleData } from "../types.ts";
import { extractModuleName, isNodeModule } from "../utils.ts";

/**
 * rollup-plugin-visualizer JSON format (v2)
 */
interface RollupVisualizerNode {
  name: string;
  uid?: string;
  children?: RollupVisualizerNode[];
}

interface RollupVisualizerNodeParts {
  renderedLength: number;
  gzipLength: number;
  brotliLength: number;
  metaUid: string;
}

interface RollupVisualizerStats {
  version: number;
  tree: RollupVisualizerNode;
  nodeParts: Record<string, RollupVisualizerNodeParts>;
}

/**
 * Parse rollup-plugin-visualizer JSON output
 */
export async function parseViteStats(
  projectName: string,
  statsFilePath: string
): Promise<BundleData> {
  const statsFile = Bun.file(statsFilePath);

  if (!(await statsFile.exists())) {
    throw new Error(
      `Stats file not found: ${statsFilePath}\n` +
        `Make sure rollup-plugin-visualizer is configured correctly in your Vite config.`
    );
  }

  const stats = (await statsFile.json()) as RollupVisualizerStats;

  if (!stats.tree || !stats.nodeParts) {
    throw new Error(
      `Invalid stats file format: ${statsFilePath}\n` +
        `Expected rollup-plugin-visualizer JSON output with 'tree' and 'nodeParts'.`
    );
  }

  const modules: ModuleData[] = [];
  const chunkSizes = new Map<string, number>();
  let totalSize = 0;

  // First pass: calculate total size for each chunk
  function calculateChunkSizes(node: RollupVisualizerNode, parentChunk?: string) {
    // Determine if this is a chunk (top-level child) or a module
    const isChunk = parentChunk === undefined;
    const chunkName = isChunk ? node.name : parentChunk!;

    // Get size for this node if it has a UID
    if (node.uid && stats.nodeParts[node.uid]) {
      const size = stats.nodeParts[node.uid].renderedLength;
      chunkSizes.set(chunkName, (chunkSizes.get(chunkName) || 0) + size);
    }

    // Recurse into children
    if (node.children) {
      for (const child of node.children) {
        calculateChunkSizes(child, chunkName);
      }
    }
  }

  // Process tree root's children (these are the chunks)
  if (stats.tree.children) {
    for (const chunk of stats.tree.children) {
      calculateChunkSizes(chunk);
    }
  }

  // Calculate total size across all chunks
  for (const size of chunkSizes.values()) {
    totalSize += size;
  }

  // Second pass: extract module data
  function extractModules(
    node: RollupVisualizerNode,
    chunkName: string,
    path: string[] = []
  ) {
    const currentPath = [...path, node.name];
    const fullPath = currentPath.join("/");

    // If this node has a UID, it's a module with size data
    if (node.uid && stats.nodeParts[node.uid]) {
      const nodePart = stats.nodeParts[node.uid];
      const chunkSize = chunkSizes.get(chunkName) || 1;

      modules.push({
        project: projectName,
        projectType: "vite",
        chunk: chunkName,
        module: fullPath,
        moduleName: extractModuleName(fullPath),
        isNodeModule: isNodeModule(fullPath),
        sizeRaw: nodePart.renderedLength,
        sizeGzip: nodePart.gzipLength,
        sizeBrotli: nodePart.brotliLength,
        percentOfChunk: (nodePart.renderedLength / chunkSize) * 100,
        percentOfProject: totalSize > 0 ? (nodePart.renderedLength / totalSize) * 100 : 0,
      });
    }

    // Recurse into children
    if (node.children) {
      for (const child of node.children) {
        extractModules(child, chunkName, currentPath);
      }
    }
  }

  // Process each chunk (top-level children of tree)
  if (stats.tree.children) {
    for (const chunk of stats.tree.children) {
      extractModules(chunk, chunk.name, []);
    }
  }

  return {
    projectName,
    projectType: "vite",
    totalSize,
    modules,
  };
}
