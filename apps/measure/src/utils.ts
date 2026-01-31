import { gzipSync, brotliCompressSync } from "node:zlib";

/**
 * Extract simplified module name from full path
 * E.g., "node_modules/lodash/dist/lodash.js" -> "lodash"
 * E.g., "node_modules/@vue/reactivity/dist/reactivity.esm.js" -> "@vue/reactivity"
 */
export function extractModuleName(modulePath: string): string {
  const parts = modulePath.split(/[/\\]/);
  const nodeModulesIndex = parts.lastIndexOf("node_modules");

  if (nodeModulesIndex === -1) {
    // Not a node_modules dependency, return the filename
    return parts[parts.length - 1] || modulePath;
  }

  // Get the package name after node_modules
  const afterNodeModules = parts.slice(nodeModulesIndex + 1);

  // Handle scoped packages (@org/package)
  if (afterNodeModules[0]?.startsWith("@")) {
    return `${afterNodeModules[0]}/${afterNodeModules[1]}`;
  }

  // Regular package
  return afterNodeModules[0] || modulePath;
}

/**
 * Check if a module path is from node_modules
 */
export function isNodeModule(modulePath: string): boolean {
  return modulePath.includes("node_modules");
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Calculate gzip size of content
 */
export function calculateGzipSize(content: string | Buffer): number {
  const buffer = typeof content === "string" ? Buffer.from(content) : content;
  return gzipSync(buffer).length;
}

/**
 * Calculate brotli size of content
 */
export function calculateBrotliSize(content: string | Buffer): number {
  const buffer = typeof content === "string" ? Buffer.from(content) : content;
  return brotliCompressSync(buffer).length;
}

/**
 * Escape CSV field value
 */
export function escapeCsvField(value: string | number): string {
  const strValue = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
}

/**
 * Get temporary directory for bundle analyzer
 */
export function getTempDir(): string {
  return "/tmp/bundle-analyzer";
}

/**
 * Get stats file path for a project
 */
export function getStatsFilePath(projectName: string): string {
  return `${getTempDir()}/${projectName}-stats.json`;
}

/**
 * Clean temporary directory
 */
export async function cleanTempDir(): Promise<void> {
  const tempDir = getTempDir();
  try {
    await Bun.$`rm -rf ${tempDir}`;
    await Bun.$`mkdir -p ${tempDir}`;
  } catch (err) {
    // Ignore errors if directory doesn't exist
  }
}
