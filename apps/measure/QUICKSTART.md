# Bundle Analyzer Quick Start

Get bundle analysis up and running in 5 minutes.

## 1. Install

```bash
cd /Users/stejs/Work/web-optimization/apps/measure
bun install
```

## 2. Initialize Config

```bash
bun run src/index.ts init
```

This creates `~/.bundle-analyzer/config.json`

## 3. Edit Config

Use the example config or edit the default:

```bash
# Option A: Copy example config
cp example-config.json ~/.bundle-analyzer/config.json

# Option B: Edit default config
vim ~/.bundle-analyzer/config.json
```

Update paths to match your projects:

```json
{
  "projects": [
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

## 4. Setup Projects

Each project needs a bundle analyzer plugin.

### For Vite (SvelteKit, Qwik, Laravel):

```bash
cd /path/to/vite-project
bun add -D rollup-plugin-visualizer
```

Add to `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins

    process.env.ANALYZE === 'true' && visualizer({
      filename: process.env.ANALYZE_OUTPUT || './stats.json',
      json: true,
      gzipSize: true,
    }),
  ].filter(Boolean),
});
```

### For Next.js:

```bash
cd /path/to/nextjs-project
bun add -D webpack-bundle-analyzer
```

Add to `next.config.js`:

```javascript
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig = {
  webpack: (config, { isServer }) => {
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

## 5. Test Setup

Validate configuration without building:

```bash
bun run src/index.ts --dry-run
```

## 6. Run Analysis

```bash
bun run src/index.ts
```

## 7. View Results

Two CSV files are generated:

**Detailed analysis:**
```bash
open bundle-analysis.csv
```

**Tree visualization:**
```bash
open bundle-analysis-tree.csv
```

Import into Google Sheets, Excel, or your favorite spreadsheet tool.

For visualization examples, see [VISUALIZATION-GUIDE.md](./VISUALIZATION-GUIDE.md).

---

## Common Commands

```bash
# Default run
bun run src/index.ts

# Specific projects only
bun run src/index.ts --only project1,project2

# Custom config location
bun run src/index.ts --config ./my-config.json

# Custom output location
bun run src/index.ts --output ./reports/analysis.csv

# Dry run (validation only)
bun run src/index.ts --dry-run

# Help
bun run src/index.ts --help
```

## Troubleshooting

### "Stats file not found"

The build succeeded but didn't generate stats. Check that:
1. Bundle analyzer plugin is installed
2. Plugin is configured with `ANALYZE=true` check
3. Plugin outputs to `process.env.ANALYZE_OUTPUT`

Test manually:
```bash
cd /path/to/project
ANALYZE=true ANALYZE_OUTPUT=./test.json bun run build
cat test.json
```

### "Config file not found"

Run `bun run src/index.ts init` to create default config.

### Build fails

1. Check `buildCommand` is correct in config
2. Ensure dependencies are installed in project
3. Try running build manually in project directory

---

## Next Steps

- Review [README.md](./README.md) for detailed documentation
- See [SETUP-GUIDE.md](./SETUP-GUIDE.md) for framework-specific setup
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand internals
