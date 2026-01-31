# Bundle Analyzer

A CLI tool for analyzing JavaScript bundle sizes across multiple web framework projects. Supports Vite-based projects (SvelteKit, Qwik, Laravel) and Next.js.

## Features

- 🔨 Parallel build execution across multiple projects
- 📊 Detailed per-dependency bundle analysis
- 📄 CSV export for easy analysis in spreadsheets
- 🎯 Support for Vite and Next.js projects
- ⚡ Built with Bun for maximum performance

## Installation

```bash
# Clone or download this repository
cd /path/to/bundle-analyzer

# Install dependencies
bun install

# Make the CLI globally available (optional)
bun link
```

Or run directly with:

```bash
bun run src/index.ts
```

## Quick Start

1. **Initialize configuration file:**

```bash
bun run src/index.ts init
```

This creates `~/.bundle-analyzer/config.json` with example projects.

2. **Edit the config file** to add your projects (see Configuration section below)

3. **Configure your projects** with the appropriate bundle analyzer plugin (see Project Setup section below)

4. **Run the analysis:**

```bash
bun run src/index.ts
```

## Configuration

The configuration file (`~/.bundle-analyzer/config.json`) specifies which projects to analyze:

```json
{
  "projects": [
    {
      "name": "my-sveltekit-app",
      "path": "/absolute/path/to/sveltekit-project",
      "type": "vite",
      "buildCommand": "bun run build"
    },
    {
      "name": "my-nextjs-app",
      "path": "/absolute/path/to/nextjs-project",
      "type": "nextjs",
      "buildCommand": "bun run build"
    }
  ],
  "outputPath": "./bundle-analysis.csv"
}
```

### Configuration Fields

- **`name`**: Unique identifier for the project
- **`path`**: Absolute path to the project directory
- **`type`**: Project type - either `"vite"` or `"nextjs"`
- **`buildCommand`**: Command to run the build (e.g., `"bun run build"`)
- **`outputPath`**: Where to save the CSV file (relative or absolute path)

## Project Setup

Each project needs to be configured with the appropriate bundle analyzer plugin. The plugin should be conditionally enabled using environment variables.

### Vite Projects (SvelteKit, Qwik, Laravel)

1. **Install rollup-plugin-visualizer:**

```bash
bun add -D rollup-plugin-visualizer
```

2. **Configure your `vite.config.ts` or `vite.config.js`:**

**TypeScript example:**

```typescript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // Your other plugins...

    // Conditional bundle analyzer
    process.env.ANALYZE === 'true' && visualizer({
      filename: process.env.ANALYZE_OUTPUT || './stats.json',
      json: true,
      gzipSize: true,
    }),
  ].filter(Boolean),
});
```

**JavaScript example:**

```javascript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // Your other plugins...

    // Conditional bundle analyzer
    process.env.ANALYZE === 'true' && visualizer({
      filename: process.env.ANALYZE_OUTPUT || './stats.json',
      json: true,
      gzipSize: true,
    }),
  ].filter(Boolean),
});
```

**Important settings:**
- `filename`: Must use `process.env.ANALYZE_OUTPUT`
- `json: true`: Required for JSON output format
- `gzipSize: true`: Recommended for accurate size metrics
- Use `.filter(Boolean)` to remove falsy values from the plugins array

### Next.js Projects

1. **Install webpack-bundle-analyzer:**

```bash
bun add -D webpack-bundle-analyzer
```

2. **Configure your `next.config.js`, `next.config.mjs`, or `next.config.ts`:**

**JavaScript/MJS example:**

```javascript
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config...

  webpack: (config, { isServer }) => {
    // Only analyze client-side bundle
    if (process.env.ANALYZE === 'true' && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'json',
          openAnalyzer: false,
          reportFilename: process.env.ANALYZE_OUTPUT || './analyze/client.json',
          generateStatsFile: false,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
```

**TypeScript example:**

```typescript
import type { NextConfig } from 'next';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig: NextConfig = {
  // Your Next.js config...

  webpack: (config, { isServer }) => {
    // Only analyze client-side bundle
    if (process.env.ANALYZE === 'true' && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'json',
          openAnalyzer: false,
          reportFilename: process.env.ANALYZE_OUTPUT || './analyze/client.json',
          generateStatsFile: false,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
```

**Important settings:**
- Check `process.env.ANALYZE === 'true'` to conditionally enable
- Use `!isServer` to only analyze client-side bundle
- `reportFilename`: Must use `process.env.ANALYZE_OUTPUT`
- `analyzerMode: 'json'`: Required for JSON output
- `openAnalyzer: false`: Prevents browser from opening

**Note:** Only the client-side bundle will be analyzed.

## CLI Usage

```bash
# Run analysis with default config
bun run src/index.ts

# Use custom config file
bun run src/index.ts --config ./my-config.json

# Analyze specific projects only
bun run src/index.ts --only my-sveltekit-app,my-nextjs-app

# Override output path
bun run src/index.ts --output ./results/analysis.csv

# Dry run (validate config without building)
bun run src/index.ts --dry-run

# Show help
bun run src/index.ts --help

# Initialize config file
bun run src/index.ts init
```

## CSV Output Format

The generated CSV contains the following columns:

| Column | Description |
|--------|-------------|
| `project` | Project name from config |
| `projectType` | `vite` or `nextjs` |
| `chunk` | Chunk/bundle file name |
| `module` | Full module/file path |
| `moduleName` | Simplified module name (e.g., `lodash`, `@vue/reactivity`) |
| `isNodeModule` | `true` if from node_modules, `false` if project source |
| `sizeRaw` | Size in bytes (uncompressed) |
| `sizeGzip` | Size in bytes (gzip compressed) |
| `sizeBrotli` | Size in bytes (brotli compressed) |
| `percentOfChunk` | Percentage this module represents of its chunk |
| `percentOfProject` | Percentage this module represents of total project bundle |

The CSV is sorted by project name, then by size (descending), making it easy to identify the largest dependencies in each project.

## Execution Flow

1. **Load and validate config** - Reads JSON config and validates all fields
2. **Prepare temporary directory** - Creates `/tmp/bundle-analyzer/` for stats files
3. **Run builds in parallel** - Executes build commands with concurrency limit (CPU count)
4. **Collect and parse results** - Parses generated JSON stats files
5. **Calculate metrics** - Computes percentages and derived values
6. **Generate CSV** - Writes all data to specified output path
7. **Print summary** - Shows total sizes, module counts, and largest dependencies

## Troubleshooting

### "Stats file not found" error

**Problem:** The build completed but no stats file was generated.

**Solution:**
- Verify the bundle analyzer plugin is correctly configured in your project
- Check that the plugin is conditionally enabled with `process.env.ANALYZE === 'true'`
- Ensure the `filename`/`reportFilename` uses `process.env.ANALYZE_OUTPUT`
- Try running the build manually with: `ANALYZE=true ANALYZE_OUTPUT=./test-stats.json bun run build`

### "Config file not found" error

**Problem:** No config file at the expected location.

**Solution:** Run `bun run src/index.ts init` to create a default config file.

### Build fails with error

**Problem:** A project's build command exits with non-zero code.

**Solution:**
- Check that the `buildCommand` in your config is correct
- Verify the project `path` is correct and accessible
- Ensure all dependencies are installed in the project
- Try running the build command manually in the project directory
- Check the error output for specific build issues

### No modules in CSV / Very few modules

**Problem:** The CSV is empty or has very few entries.

**Solution:**
- Vite projects: Make sure `json: true` is set in the visualizer plugin
- Next.js projects: Make sure `analyzerMode: 'json'` is set
- Check that the build actually produced output files
- Verify the stats JSON file is not empty by inspecting `/tmp/bundle-analyzer/{project-name}-stats.json`

### Permission denied errors

**Problem:** Cannot write to `/tmp/bundle-analyzer/` or output path.

**Solution:**
- Check file system permissions
- Try using a different output path with `--output`
- On some systems, `/tmp` may have restrictions - the tool will create the directory if it doesn't exist

## Advanced Usage

### Analyzing a subset of projects

Use the `--only` flag to analyze specific projects:

```bash
bun run src/index.ts --only frontend,backend
```

### Automating analysis

You can run the analyzer as part of your CI/CD pipeline:

```bash
#!/bin/bash
bun run src/index.ts --output "./reports/bundle-$(date +%Y%m%d).csv"
```

### Comparing results over time

Save CSV files with timestamps and use spreadsheet tools to compare:

```bash
bun run src/index.ts --output "./history/bundle-$(git rev-parse --short HEAD).csv"
```

## Performance

- Builds run in parallel with concurrency limited to CPU core count
- Large JSON stats files (several MB) are handled efficiently using streaming
- Temporary files are cleaned up automatically on exit

## License

MIT

## Contributing

Issues and pull requests welcome!
