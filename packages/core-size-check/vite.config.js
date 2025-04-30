import {defineConfig} from "vite";

// @ts-check

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.js',
            formats: ['iife'],
            name: 'app',
        },
        target: 'es2020',
    },
})