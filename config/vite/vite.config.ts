import { defineConfig, type UserConfigFnObject } from 'vite';
import { type PackageJSON, unscope } from './package.helper.js';

/**
 * Define a vite config for a lib.
 *
 * - build exclusively to ESM
 * - file follow the `<unscopedName>.<env>` format where `unscopedName` is passed as parameter and `env` is the build
 * mode vite is run in ( most often `production` or `development`)
 * - the entry point is assumed to be named `index.ts` and be in the `src/` directory at the same level as the invoking
 * config file
 *
 * @param  {PackageJSON} pkg the content of the package's `package.json` file as an object
 */
export function defineLibConfig(pkg: PackageJSON): UserConfigFnObject {
	return defineConfig(({ mode }) => ({
		build: {
			lib: {
				entry: './src/index.ts',
				formats: [ 'es' ],
				fileName: `${ unscope(pkg.name) }.${ mode }`,
			},
			rollupOptions: {
				external: Object.keys(pkg.dependencies ?? {}),
			},
			minify: mode === 'development' ? false : 'esbuild',
			target: 'es2020',
			emptyOutDir: false,
			resolve: {
				condition: [ 'module', 'browser', 'development|production', 'zoram:internal' ],
			},
		},
		server: {
			hmr: {
				// error overlays can lead to false positives when running Vitest's browser mode in watch mode
				overlay: mode !== 'test' && mode !== 'benchmark',
			},
		},
	}));
}