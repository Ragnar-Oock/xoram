import { defineLibConfig } from '@repo/config-vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineProject, mergeConfig } from 'vitest/config';
import pkg from './package.json' with { type: 'json' };

export default defineProject(env =>
	mergeConfig(
		mergeConfig(
			defineLibConfig(pkg)(env),
			{
				plugins: [
					vue(),
					vueDevTools({
						launchEditor: 'webstorm',
					}),
				],
				resolve: {
					alias: {
						'@zoram/core': '@zoram/core/dev',
					},
				},
			},
		),
		defineProject({
			test: {
				environment: 'happy-dom',
			},
		}),
	));