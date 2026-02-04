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
        visualizer({
            filename: `./temp/${Date.now()}-stats.json`,
            template: "raw-data",
            gzipSize: true,
        }),

        // visualizer({
        //     filename: `./temp/${Date.now()}-stats.html`,
        //     template: "treemap",
        //     gzipSize: true,
        // }),
    ].filter(Boolean),
});
