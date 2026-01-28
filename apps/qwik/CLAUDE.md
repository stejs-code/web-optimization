
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Framework

This is a Qwik project using QwikCity for directory-based routing and SSR. Qwik is a resumable framework that sends minimal JavaScript to the browser by serializing application state on the server.

## Development Commands

Use `bun` instead of `npm` for all commands:

- `bun install` - Install dependencies
- `bun start` or `bun run dev` - Start dev server with SSR (opens at localhost)
- `bun run build` - Production build (runs type check + client & server builds)
- `bun run preview` - Build and preview production build locally
- `bun run lint` - Lint TypeScript files in src/
- `bun run fmt` - Format code with Prettier
- `bun run fmt.check` - Check code formatting
- `bun run build.types` - Type check without emitting files

## Architecture

### Entry Points

- `src/entry.ssr.tsx` - SSR entry point for all server-side rendering (dev, preview, build). Vite starts here, not from index.html.
- `src/entry.dev.tsx` - Development-only entry point
- `src/entry.preview.tsx` - Preview build entry point
- `src/root.tsx` - Application root component wrapping QwikCityProvider, contains <head> and <body>

### Directory Structure

- `src/routes/` - Directory-based routing. Files named `index.tsx` are pages, `layout.tsx` files define layouts, `index.ts` files are endpoints.
- `src/components/` - Reusable components
- `src/img/` - Image assets that can be imported in components
- `public/` - Static assets (served as-is by Vite)

### Key Concepts

- **component$()** - Qwik components use `component$()` wrapper for lazy loading
- **$** suffix - Indicates lazy-loadable boundaries in Qwik (component$, useTask$, etc.)
- **RouterOutlet** - Renders the matched route component
- **DocumentHead export** - Route files can export a `head` object for meta tags and title
- **Path aliases** - `~/` maps to `./src/` (configured in tsconfig.json)

### Configuration

- `vite.config.ts` - Vite config with qwikVite() and qwikCity() plugins. All Qwik packages must be in devDependencies (not dependencies) or build will fail.
- `tsconfig.json` - JSX import source is `@builder.io/qwik`
- `eslint.config.js` - Flat config using TypeScript ESLint and eslint-plugin-qwik. Disables `@typescript-eslint/no-explicit-any`.

## Important Notes

- Do not move `@builder.io/qwik*` packages to dependencies - they must stay in devDependencies
- Vite dev mode requests many .js files - this is normal and does not reflect production builds
- The preview server is for local preview only, not production use
- Use `bun run qwik add` to add integrations (Cloudflare, Netlify, Express, SSG)