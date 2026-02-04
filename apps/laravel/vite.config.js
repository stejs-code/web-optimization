import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import {visualizer} from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        process.env.ANALYZE === 'true' && visualizer({
            filename: process.env.ANALYZE_OUTPUT || './stats.json',
            template: 'raw-data',
            gzipSize: true,
        }),
    ].filter(Boolean),
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
