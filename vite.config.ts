import { defineConfig } from 'vitest/config';

// see https://vitest.dev/guide/browser/#typescript
/// <reference types="@vitest/browser/providers/playwright" />

export default defineConfig(({ mode }) => ({
	test: {
		projects: [
			'packages/*',
			'plugins/*',
		],
		mockReset: true,
		coverage: {
			provider: 'v8',
			include: [
				'{packages,plugins}/*/src/**',
			],
			exclude: [
				'packages/core-size-check', // this is a package used for checking final bundle size only
			],
		},

		passWithNoTests: true,
		includeTaskLocation: mode !== 'CI',
		open: false,
	},
}));