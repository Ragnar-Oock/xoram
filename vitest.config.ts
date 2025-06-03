import { defineConfig } from 'vitest/config';

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
				'src/**',
			],
		},

		passWithNoTests: mode !== 'CI',
	},
}));