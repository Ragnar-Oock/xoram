import vue from '@vitejs/plugin-vue';
import { defineConfig, mergeConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineLibConfig } from '../../config/vite/vite.config';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(env =>
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
);