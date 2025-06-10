import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineProject, mergeConfig } from 'vitest/config';
import { defineLibConfig } from '../../config/vite/vite.config';
import { getBrowserTestConfig } from '../../config/vite/vitest.config';
import pkg from './package.json' with { type: 'json' };

export default defineProject(env =>
	mergeConfig(
		mergeConfig(
			defineLibConfig(pkg)(env),
			{
				plugins: [
					vue(),
					env.mode === 'development' ? vueDevTools({
						launchEditor: 'webstorm',
					}) : undefined,
				],
			},
		),
		getBrowserTestConfig(pkg)(env),
	));