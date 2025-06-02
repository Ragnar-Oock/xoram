/**
 * @type {import('vitest').InlineConfig}
 */
export const VitestConfig = {
	coverage: {
		provider: 'v8',
		include: [
			'src/**',
		],
	},

	environment: 'happy-dom',
	mockReset: true,

};