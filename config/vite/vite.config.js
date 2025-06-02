// @ts-check
import {defineConfig} from 'vite';
import {VitestConfig as test} from './vitest.config.js';

/**
 * @typedef PackageJSON
 *
 * @property {string} name - package's name
 * @property {Record<string, string>} [dependencies] - package's dependencies if any
 */

export default defineConfig({
	test,
});

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
 *
 * @returns {import('vite').UserConfigFnObject}
 */
export function defineLibConfig(pkg) {
	return defineConfig(({mode}) => ({
		build: {
			lib: {
				entry: './src/index.ts',
				formats: ['es'],
				fileName: `${pkg.name.replace(/@.+\//, '')}.${mode}`,
			},
			rollupOptions: {
				external: Object.keys(pkg.dependencies ?? {}),
			},
			minify: mode === 'development' ? false : 'esbuild',
			target: 'es2020',
			emptyOutDir: false,
		},
	}));
}