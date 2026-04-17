import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node', // Since we are testing Electron main process / sqlite DB
        globals: true,
        include: ['src/**/*.test.{ts,tsx}'], // Include both main and renderer tests
        setupFiles: ['./src/vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/renderer/src'),
            '@preload': path.resolve(__dirname, './src/preload'),
        },
    },
});
