import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { defineLibConfig } from '../../config/vite/vite.config';
import { getNodeTestConfig } from '../../config/vite/vitest.config';
import pkg from './package.json' with { type: 'json' };
import { getDirectories } from './script/get-directories.helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(env =>
	mergeConfig(
		mergeConfig(
			defineLibConfig(pkg)(env),
			getNodeTestConfig(pkg)(env),
		),
		{
			build: {
				lib: {
					entry: Object.fromEntries(
						getDirectories('./src')
							.map(dir => [ dir, resolve(__dirname, `./src/${ dir }/index.ts`) ] as [ string, string ]),
					),
					fileName: (_, name) => `${ name }.js`,
				},
			},
		} satisfies UserConfig,
	),
);