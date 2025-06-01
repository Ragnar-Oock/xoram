import vue from '@vitejs/plugin-vue';

import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
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
	test: {
		environment: 'happy-dom',
	},
});
