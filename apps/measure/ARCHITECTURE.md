# Bundle Analyzer Architecture

## Overview

The bundle analyzer is a CLI tool built with Bun and TypeScript that analyzes JavaScript bundle sizes across multiple web framework projects in parallel.

## File Structure

```
src/
├── index.ts              # CLI entry point, argument parsing, main execution
├── config.ts             # Configuration loading, validation, and initialization
├── analyzer.ts           # Main analysis orchestration and parallel build execution
├── types.ts              # TypeScript type definitions shared across modules
├── utils.ts              # Utility functions (size formatting, module name extraction, etc.)
├── csv.ts                # CSV generation and file writing
└── parsers/
    ├── vite.ts           # Parser for rollup-plugin-visualizer JSON output
    └── nextjs.ts         # Parser for webpack-bundle-analyzer JSON output
```

## Data Flow

```
┌─────────────────┐
│   CLI Input     │
│  (index.ts)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Load Config    │
│  (config.ts)    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Validate &    │
│ Filter Projects │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Run Builds in   │
│    Parallel     │
│ (analyzer.ts)   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Parse Stats    │
│   JSON Files    │
│ (parsers/*.ts)  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Generate CSV    │
│   (csv.ts)      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Print Summary   │
│   & Output      │
└─────────────────┘
```

## Core Components

### 1. CLI Interface (index.ts)

**Responsibilities:**
- Parse command-line arguments
- Handle help and init commands
- Coordinate overall execution flow
- Handle process signals (SIGINT, SIGTERM)

**Key Functions:**
- `parseArgs()` - Parse CLI arguments into structured options
- `main()` - Main entry point

### 2. Configuration Management (config.ts)

**Responsibilities:**
- Load configuration from JSON file
- Validate project configurations
- Filter projects based on CLI options
- Create default configuration

**Key Functions:**
- `loadConfig()` - Load and validate configuration
- `initConfig()` - Create default config file

**Configuration Schema:**
```typescript
{
  projects: [
    {
      name: string;        // Unique project identifier
      path: string;        // Absolute path to project
      type: "vite" | "nextjs";  // Project type
      buildCommand: string;     // Build command to execute
    }
  ],
  outputPath: string;    // Where to save CSV
}
```

### 3. Analysis Orchestration (analyzer.ts)

**Responsibilities:**
- Execute builds in parallel with concurrency control
- Collect and aggregate results
- Handle build failures gracefully
- Print summary statistics

**Key Functions:**
- `buildProject()` - Build a single project and parse its stats
- `buildProjectsParallel()` - Execute builds with concurrency limit
- `printSummary()` - Display analysis results
- `analyzeProjects()` - Main orchestration function

**Build Process:**
1. Set environment variables (`ANALYZE=true`, `ANALYZE_OUTPUT`)
2. Spawn build process in project directory
3. Wait for completion and check exit code
4. Parse generated stats file
5. Return build result with bundle data

**Concurrency Control:**
- Limits parallel builds to number of CPU cores
- Processes projects in batches
- Continues on individual build failures

### 4. Stats Parsers (parsers/*.ts)

**Responsibilities:**
- Parse framework-specific bundle analysis JSON
- Extract module-level data
- Calculate size metrics and percentages

#### Vite Parser (parsers/vite.ts)

Parses `rollup-plugin-visualizer` JSON output:
- Recursively extracts modules from chunk groups
- Handles nested module structures
- Preserves gzip size information

#### Next.js Parser (parsers/nextjs.ts)

Parses `webpack-bundle-analyzer` JSON output:
- Processes webpack chunks and modules
- Extracts module sizes from stats
- Handles client-side bundle only

**Common Output Format:**
```typescript
{
  projectName: string;
  projectType: "vite" | "nextjs";
  totalSize: number;
  modules: [
    {
      project: string;
      projectType: string;
      chunk: string;
      module: string;         // Full path
      moduleName: string;     // Simplified name
      isNodeModule: boolean;
      sizeRaw: number;
      sizeGzip: number;
      sizeBrotli: number;
      percentOfChunk: number;
      percentOfProject: number;
    }
  ]
}
```

### 5. CSV Generation (csv.ts)

**Responsibilities:**
- Convert bundle data to CSV format
- Sort modules by project and size
- Properly escape CSV fields
- Write to file system

**Key Functions:**
- `generateCSV()` - Convert bundle data to CSV string
- `writeCSV()` - Write CSV to file

**CSV Format:**
- Header row with column names
- One row per module
- Sorted by project name, then size descending
- Proper CSV escaping for special characters

### 6. Utilities (utils.ts)

**Shared Utilities:**
- `extractModuleName()` - Extract package name from file path
- `isNodeModule()` - Check if path is from node_modules
- `formatBytes()` - Human-readable size formatting
- `calculateGzipSize()` - Compute gzip compressed size
- `calculateBrotliSize()` - Compute brotli compressed size
- `escapeCsvField()` - Escape special characters for CSV
- `getTempDir()` - Get temporary directory path
- `getStatsFilePath()` - Get stats file path for project
- `cleanTempDir()` - Clean up temporary files

## Environment Variables

The tool sets these environment variables when running builds:

- `ANALYZE=true` - Enables bundle analyzer plugin
- `ANALYZE_OUTPUT=/tmp/bundle-analyzer/{project}-stats.json` - Output path for stats

## Temporary Files

**Location:** `/tmp/bundle-analyzer/`

**Files:**
- `{project-name}-stats.json` - Bundle analysis stats for each project

**Cleanup:**
- Directory is cleaned before each run
- Files persist after run for debugging
- Manual cleanup: `rm -rf /tmp/bundle-analyzer`

## Error Handling

### Build Failures
- Each project build is isolated
- Failures are logged but don't stop other builds
- Final summary shows successful vs failed builds
- Exit code reflects overall success

### Configuration Errors
- Invalid config causes immediate exit with error message
- Missing config prompts user to run `init` command
- Missing project paths show warnings but continue

### Missing Stats Files
- Shows descriptive error with setup instructions
- Suggests manual test command
- Skips project and continues with others

## Performance Optimizations

### Parallel Execution
- Builds run in parallel up to CPU core count
- Reduces total analysis time significantly
- Independent project failures don't block others

### Efficient File Handling
- Uses Bun's native file APIs (`Bun.file`, `Bun.write`)
- Streams large JSON files efficiently
- Minimal memory footprint even for large projects

### Process Management
- Uses `Bun.spawn` for subprocess execution
- Proper cleanup on exit signals
- No zombie processes

## Extension Points

### Adding New Framework Support

1. Create parser in `src/parsers/{framework}.ts`
2. Implement parser function matching signature:
   ```typescript
   async function parseStats(
     projectName: string,
     statsFilePath: string
   ): Promise<BundleData>
   ```
3. Add framework type to `ProjectType` in `config.ts`
4. Add parser import and switch case in `analyzer.ts`

### Adding New Metrics

1. Add fields to `ModuleData` type in `types.ts`
2. Update parsers to extract/calculate new metrics
3. Add columns to CSV header in `csv.ts`
4. Update module row generation to include new fields

### Custom Output Formats

Alternative to CSV:
1. Create new file in `src/` (e.g., `json.ts`, `html.ts`)
2. Implement output generation function
3. Add CLI option for output format
4. Call appropriate generator based on option

## Testing Strategy

### Manual Testing
- Use `--dry-run` to validate config without building
- Test with `--only` to focus on single project
- Verify CSV output in spreadsheet tool

### Integration Testing
- Set up test projects with known bundle sizes
- Run analyzer and verify CSV output matches expected
- Test with various framework configurations

### Error Testing
- Test with invalid config
- Test with non-existent project paths
- Test with missing bundle analyzer plugins
- Test with failed builds

## Security Considerations

### Command Injection
- Build commands are split on spaces, not shell-escaped
- Environment variables use fixed structure
- No user input directly interpolated into shell commands

### File System Access
- Config paths can be absolute or relative
- Output paths are validated and resolved
- Temporary directory has fixed location

### Sensitive Data
- CSV may contain file paths (internal project structure)
- No credentials or secrets are processed
- Recommend adding `*.csv` to `.gitignore`
