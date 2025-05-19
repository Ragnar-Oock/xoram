import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	build: {
		lib: {
			entry: './src/index.ts',
			formats: [ 'es' ],
			fileName: `core.${ mode }`,
		},
		rollupOptions: {
			external: [ 'mitt' ],
		},
		minify: mode === 'development' ? false : 'esbuild',
		target: 'es2020',
		emptyOutDir: false,
	},
	test: {
		coverage: {
			include: [
				'src/**',
			],
		},
	},
}));