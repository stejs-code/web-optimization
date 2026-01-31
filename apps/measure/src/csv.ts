import type { BundleData, ModuleData } from "./types.ts";
import { escapeCsvField } from "./utils.ts";

/**
 * Generate CSV content from bundle data
 */
export function generateCSV(bundleDataList: BundleData[]): string {
  // CSV header
  const header = [
    "project",
    "projectType",
    "chunk",
    "module",
    "moduleName",
    "isNodeModule",
    "sizeRaw",
    "sizeGzip",
    "sizeBrotli",
    "percentOfChunk",
    "percentOfProject",
  ];

  const rows: string[] = [header.join(",")];

  // Collect all modules
  const allModules: ModuleData[] = [];
  for (const bundleData of bundleDataList) {
    allModules.push(...bundleData.modules);
  }

  // Sort by project name, then by size descending
  allModules.sort((a, b) => {
    if (a.project !== b.project) {
      return a.project.localeCompare(b.project);
    }
    return b.sizeRaw - a.sizeRaw;
  });

  // Generate rows
  for (const module of allModules) {
    const row = [
      escapeCsvField(module.project),
      escapeCsvField(module.projectType),
      escapeCsvField(module.chunk),
      escapeCsvField(module.module),
      escapeCsvField(module.moduleName),
      escapeCsvField(module.isNodeModule),
      escapeCsvField(module.sizeRaw),
      escapeCsvField(module.sizeGzip),
      escapeCsvField(module.sizeBrotli),
      escapeCsvField(module.percentOfChunk.toFixed(2)),
      escapeCsvField(module.percentOfProject.toFixed(2)),
    ];
    rows.push(row.join(","));
  }

  return rows.join("\n");
}

/**
 * Write CSV to file
 */
export async function writeCSV(
  bundleDataList: BundleData[],
  outputPath: string
): Promise<void> {
  const csv = generateCSV(bundleDataList);
  await Bun.write(outputPath, csv);
}
