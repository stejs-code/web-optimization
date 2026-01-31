import * as path from "node:path";
import * as os from "node:os";

export type ProjectType = "vite" | "nextjs";

export interface ProjectConfig {
  name: string;
  path: string;
  type: ProjectType;
  buildCommand: string;
}

export interface Config {
  projects: ProjectConfig[];
  outputPath: string;
}

export interface CLIOptions {
  configPath?: string;
  only?: string[];
  output?: string;
  dryRun?: boolean;
}

const DEFAULT_CONFIG_PATH = path.join(
  os.homedir(),
  ".bundle-analyzer",
  "config.json"
);

/**
 * Load and validate configuration from file
 */
export async function loadConfig(
  options: CLIOptions
): Promise<Config> {
  const configPath = options.configPath || DEFAULT_CONFIG_PATH;
  const configFile = Bun.file(configPath);

  if (!(await configFile.exists())) {
    throw new Error(
      `Config file not found at ${configPath}\n` +
        `Run 'bundle-analyzer init' to create a default configuration.`
    );
  }

  const config = (await configFile.json()) as Config;

  // Validate config structure
  if (!config.projects || !Array.isArray(config.projects)) {
    throw new Error("Config must have a 'projects' array");
  }

  if (config.projects.length === 0) {
    throw new Error("Config must have at least one project");
  }

  // Validate each project
  for (const project of config.projects) {
    if (!project.name) {
      throw new Error("Each project must have a 'name' field");
    }
    if (!project.path) {
      throw new Error(`Project '${project.name}' must have a 'path' field`);
    }
    if (!project.type) {
      throw new Error(`Project '${project.name}' must have a 'type' field`);
    }
    if (project.type !== "vite" && project.type !== "nextjs") {
      throw new Error(
        `Project '${project.name}' has invalid type '${project.type}'. Must be 'vite' or 'nextjs'`
      );
    }
    if (!project.buildCommand) {
      throw new Error(
        `Project '${project.name}' must have a 'buildCommand' field`
      );
    }

    // Resolve relative paths
    project.path = path.resolve(project.path);

    // Check if path exists
    try {
      const stat = await Bun.file(project.path).exists();
      if (!stat) {
        console.warn(`⚠️  Warning: Project path does not exist: ${project.path}`);
      }
    } catch (err) {
      console.warn(`⚠️  Warning: Cannot access project path: ${project.path}`);
    }
  }

  // Filter projects if --only is specified
  if (options.only && options.only.length > 0) {
    const filteredProjects = config.projects.filter((p) =>
      options.only!.includes(p.name)
    );

    if (filteredProjects.length === 0) {
      throw new Error(
        `No projects matched the --only filter: ${options.only.join(", ")}`
      );
    }

    config.projects = filteredProjects;
  }

  // Override output path if specified
  if (options.output) {
    config.outputPath = path.resolve(options.output);
  } else if (config.outputPath) {
    config.outputPath = path.resolve(config.outputPath);
  } else {
    config.outputPath = path.resolve("./bundle-analysis.csv");
  }

  return config;
}

/**
 * Create default config file
 */
export async function initConfig(): Promise<void> {
  const configDir = path.dirname(DEFAULT_CONFIG_PATH);

  // Create directory if it doesn't exist
  await Bun.$`mkdir -p ${configDir}`;

  const defaultConfig: Config = {
    projects: [
      {
        name: "example-vite-app",
        path: "/absolute/path/to/your/vite-project",
        type: "vite",
        buildCommand: "bun run build",
      },
      {
        name: "example-nextjs-app",
        path: "/absolute/path/to/your/nextjs-project",
        type: "nextjs",
        buildCommand: "bun run build",
      },
    ],
    outputPath: "./bundle-analysis.csv",
  };

  await Bun.write(DEFAULT_CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));

  console.log(`✅ Created default config at: ${DEFAULT_CONFIG_PATH}`);
  console.log(`\nEdit this file to configure your projects, then run:`);
  console.log(`  bundle-analyzer`);
}
