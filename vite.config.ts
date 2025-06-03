import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineConfig } from 'vitest/config';

// see https://vitest.dev/guide/browser/#typescript
/// <reference types="@vitest/browser/providers/playwright" />

export default defineConfig(({ mode }) => ({
	test: {
		projects: [
			{
				extends: true,
				test: {
					include: [
						'{packages,plugins}/*/tests/unit/**/*.spec.ts',
					],
					name: 'unit',
					environment: 'node',
				},
			},
			{
				extends: true,
				plugins: [
					vue(),
					mode === 'dev' ? vueDevTools({
						launchEditor: 'webstorm',
					}) : undefined,
				],
				test: {
					include: [
						'{packages,plugins}/*/tests/browser/**/*.spec.ts',
					],
					name: 'browser:vue',
					browser: {
						provider: 'playwright',
						enabled: true,
						instances: [
							{
								browser: 'firefox',
							},
						],
					},
				},
			},
		],
		mockReset: true,
		coverage: {
			provider: 'v8',
			include: [
				'src/**',
			],
		},

		passWithNoTests: mode !== 'CI',

		open: false,
	},
}));