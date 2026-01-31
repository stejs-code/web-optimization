#!/usr/bin/env bun

import { loadConfig, initConfig, type CLIOptions } from "./config.ts";
import { analyzeProjects } from "./analyzer.ts";

const USAGE = `
Bundle Analyzer - Analyze JavaScript bundle sizes across multiple frameworks

USAGE:
  bundle-analyzer [options]

OPTIONS:
  --config <path>        Path to config file (default: ~/.bundle-analyzer/config.json)
  --only <names>         Comma-separated list of project names to analyze
  --output <path>        Output CSV file path (overrides config)
  --dry-run              Validate config and show what would be executed
  --help                 Show this help message

COMMANDS:
  bundle-analyzer init   Create default config file at ~/.bundle-analyzer/config.json

EXAMPLES:
  bundle-analyzer
  bundle-analyzer --config ./my-config.json
  bundle-analyzer --only sveltekit-app,nextjs-app
  bundle-analyzer --output ./results.csv
  bundle-analyzer --dry-run
  bundle-analyzer init
`;

/**
 * Parse CLI arguments
 */
function parseArgs(args: string[]): CLIOptions & { command?: string; help?: boolean } {
  const options: CLIOptions & { command?: string; help?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "init") {
      options.command = "init";
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--config" || arg === "-c") {
      options.configPath = args[++i];
    } else if (arg === "--only") {
      options.only = args[++i]?.split(",").map((s) => s.trim());
    } else if (arg === "--output" || arg === "-o") {
      options.output = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (!arg.startsWith("-")) {
      // Ignore positional arguments
    } else {
      console.error(`Unknown option: ${arg}`);
      console.log(USAGE);
      process.exit(1);
    }
  }

  return options;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    console.log(USAGE);
    process.exit(0);
  }

  if (options.command === "init") {
    await initConfig();
    process.exit(0);
  }

  try {
    // Load and validate config
    const config = await loadConfig(options);

    console.log(`📋 Loaded config with ${config.projects.length} project(s)`);
    for (const project of config.projects) {
      console.log(`   - ${project.name} (${project.type}) at ${project.path}`);
    }

    // Run analysis
    await analyzeProjects(config.projects, config.outputPath, options.dryRun || false);
  } catch (err) {
    console.error(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on("SIGINT", () => {
  console.log("\n\n🛑 Interrupted by user");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Terminated");
  process.exit(0);
});

void main();