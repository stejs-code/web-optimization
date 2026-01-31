import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        sveltekit(),
        imagetools({
            defaultDirectives: () => {
                return new URLSearchParams({
                    quality: '80'
                });
            }
        }),
        process.env.ANALYZE === 'true' && visualizer({
            filename: process.env.ANALYZE_OUTPUT || './stats.json',
            json: true,
            template: 'raw-data',
            gzipSize: true,
        }),
    ].filter(Boolean),
});
