import type { BundleData } from "./types.ts";
import { escapeCsvField } from "./utils.ts";

interface TreeNode {
  name: string;
  parent: string;
  value: number;
}

/**
 * Generate tree graph CSV from bundle data
 * Format: name, parent, value
 * Hierarchy: project -> moduleName -> module -> size
 */
export function generateTreeCSV(bundleDataList: BundleData[]): string {
  const rows: string[] = [["name", "parent", "value"].join(",")];
  const nodes: TreeNode[] = [];

  // Track aggregated sizes for module names within each project
  const moduleNameSizes = new Map<string, Map<string, number>>();

  // First pass: aggregate sizes by moduleName within each project
  for (const bundleData of bundleDataList) {
    if (!moduleNameSizes.has(bundleData.projectName)) {
      moduleNameSizes.set(bundleData.projectName, new Map());
    }
    const projectModules = moduleNameSizes.get(bundleData.projectName)!;

    for (const module of bundleData.modules) {
      const currentSize = projectModules.get(module.moduleName) || 0;
      projectModules.set(module.moduleName, currentSize + module.sizeRaw);
    }
  }

  // Generate tree structure
  for (const bundleData of bundleDataList) {
    // Level 1: Project (root level)
    nodes.push({
      name: bundleData.projectName,
      parent: "",
      value: bundleData.totalSize,
    });

    // Level 2: Module names under project
    const projectModules = moduleNameSizes.get(bundleData.projectName)!;
    const processedModuleNames = new Set<string>();

    for (const module of bundleData.modules) {
      // Add module name node if not already added
      if (!processedModuleNames.has(module.moduleName)) {
        const moduleNameSize = projectModules.get(module.moduleName) || 0;
        nodes.push({
          name: `${bundleData.projectName}/${module.moduleName}`,
          parent: bundleData.projectName,
          value: moduleNameSize,
        });
        processedModuleNames.add(module.moduleName);
      }

      // Level 3: Individual modules under module name
      nodes.push({
        name: `${bundleData.projectName}/${module.moduleName}/${module.module}`,
        parent: `${bundleData.projectName}/${module.moduleName}`,
        value: module.sizeRaw,
      });
    }
  }

  // Sort nodes by value descending
  nodes.sort((a, b) => {
    // Sort by parent first (to group hierarchies together)
    if (a.parent !== b.parent) {
      return a.parent.localeCompare(b.parent);
    }
    // Then by value descending
    return b.value - a.value;
  });

  // Generate CSV rows
  for (const node of nodes) {
    const row = [
      escapeCsvField(node.name),
      escapeCsvField(node.parent),
      escapeCsvField(node.value),
    ];
    rows.push(row.join(","));
  }

  return rows.join("\n");
}

/**
 * Write tree CSV to file
 */
export async function writeTreeCSV(
  bundleDataList: BundleData[],
  outputPath: string
): Promise<void> {
  const csv = generateTreeCSV(bundleDataList);
  await Bun.write(outputPath, csv);
}
