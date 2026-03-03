import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            '@': '/src/renderer/src',
            '@preload': '/src/preload',
        },
    },
});
