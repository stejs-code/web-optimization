import type { ProjectConfig } from "./config.ts";
import type { BuildResult, BundleData } from "./types.ts";
import { getStatsFilePath, cleanTempDir, getTempDir, formatBytes } from "./utils.ts";
import { parseViteStats } from "./parsers/vite.ts";
import { parseNextjsStats } from "./parsers/nextjs.ts";
import * as os from "node:os";

/**
 * Run build for a single project
 */
async function buildProject(
  project: ProjectConfig,
  dryRun: boolean
): Promise<BuildResult> {
  const statsFilePath = getStatsFilePath(project.name);

  console.log(`\n🔨 Building ${project.name} (${project.type})...`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would run: ${project.buildCommand}`);
    console.log(`  [DRY RUN] Working directory: ${project.path}`);
    console.log(`  [DRY RUN] Output stats to: ${statsFilePath}`);
    return {
      projectName: project.name,
      success: true,
    };
  }

  try {
    // Run build command with environment variables
    const proc = Bun.spawn(project.buildCommand.split(" "), {
      cwd: project.path,
      env: {
        ...process.env,
        ANALYZE: "true",
        ANALYZE_OUTPUT: statsFilePath,
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await proc.exited;

    if (output !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`Build failed with exit code ${output}\n${stderr}`);
    }

    console.log(`✅ Build completed: ${project.name}`);

    // Parse stats file
    let bundleData: BundleData;

    if (project.type === "vite") {
      bundleData = await parseViteStats(project.name, statsFilePath);
    } else if (project.type === "nextjs") {
      bundleData = await parseNextjsStats(project.name, statsFilePath);
    } else {
      throw new Error(`Unknown project type: ${project.type}`);
    }

    console.log(`📊 Analyzed ${bundleData.modules.length} modules`);

    return {
      projectName: project.name,
      success: true,
      bundleData,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed to build ${project.name}: ${errorMsg}`);

    return {
      projectName: project.name,
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Run builds in parallel with concurrency limit
 */
async function buildProjectsParallel(
  projects: ProjectConfig[],
  dryRun: boolean
): Promise<BuildResult[]> {
  const concurrency = os.cpus().length;
  const results: BuildResult[] = [];
  const queue = [...projects];

  console.log(`\n🚀 Building ${projects.length} projects (concurrency: ${concurrency})`);

  // Process projects in batches
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await Promise.all(
      batch.map((project) => buildProject(project, dryRun))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Print summary of results
 */
function printSummary(results: BuildResult[], outputPath: string, treeOutputPath?: string): void {
  console.log("\n" + "=".repeat(60));
  console.log("📈 BUNDLE ANALYSIS SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful builds: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed builds: ${failed.length}`);
    for (const result of failed) {
      console.log(`   - ${result.projectName}: ${result.error}`);
    }
  }

  // Print per-project summary
  for (const result of successful) {
    if (result.bundleData) {
      const data = result.bundleData;
      const nodeModules = data.modules.filter((m) => m.isNodeModule);
      const projectFiles = data.modules.filter((m) => !m.isNodeModule);

      console.log(`\n📦 ${data.projectName} (${data.projectType})`);
      console.log(`   Total size: ${formatBytes(data.totalSize)}`);
      console.log(`   Modules: ${data.modules.length}`);
      console.log(`   - Node modules: ${nodeModules.length}`);
      console.log(`   - Project files: ${projectFiles.length}`);

      // Show top 5 largest modules
      const topModules = [...data.modules]
        .sort((a, b) => b.sizeRaw - a.sizeRaw)
        .slice(0, 5);

      console.log(`   Top 5 largest modules:`);
      for (const mod of topModules) {
        console.log(
          `     - ${mod.moduleName}: ${formatBytes(mod.sizeRaw)} (${mod.percentOfProject.toFixed(1)}%)`
        );
      }
    }
  }

  console.log(`\n📄 Detailed CSV output: ${outputPath}`);
  if (treeOutputPath) {
    console.log(`🌳 Tree graph CSV output: ${treeOutputPath}`);
  }
  console.log("=".repeat(60) + "\n");
}

/**
 * Main analysis function
 */
export async function analyzeProjects(
  projects: ProjectConfig[],
  outputPath: string,
  dryRun: boolean
): Promise<void> {
  // Prepare temporary directory
  await cleanTempDir();

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE - No builds will be executed\n");
  }

  // Run builds in parallel
  const results = await buildProjectsParallel(projects, dryRun);

  if (dryRun) {
    console.log("\n✅ Dry run completed. Run without --dry-run to execute builds.");
    return;
  }

  // Collect successful bundle data
  const bundleDataList: BundleData[] = results
    .filter((r) => r.success && r.bundleData)
    .map((r) => r.bundleData!);

  if (bundleDataList.length === 0) {
    console.error("\n❌ No successful builds to export");
    return;
  }

  // Generate and write CSV
  const { writeCSV } = await import("./csv.ts");
  await writeCSV(bundleDataList, outputPath);

  // Generate and write tree CSV
  const { writeTreeCSV } = await import("./tree.ts");
  const treeOutputPath = outputPath.replace(/\.csv$/, "-tree.csv");
  await writeTreeCSV(bundleDataList, treeOutputPath);

  // Print summary
  printSummary(results, outputPath, treeOutputPath);
}
