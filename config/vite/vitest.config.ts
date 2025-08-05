import type { UserProjectConfigFn } from 'vitest/config';
import { defineProject } from 'vitest/config';
import { PackageJSON, unscope } from './package.helper.ts';

/**
 * Create a Vite/Vitest config for a package with tests running in a browser environment only
 * @param pkg the content of the `package.json` for that project
 */
export function getBrowserTestConfig(pkg: PackageJSON): UserProjectConfigFn {
	return defineProject(env => ({
		extends: true,
		test: {
			include: [
				'tests/browser/**/*.spec.ts',
			],
			name: `browser:${ unscope(pkg.name) }`,
			browser: {
				provider: 'playwright',
				enabled: true,
				headless: env.mode === 'CI',
				instances: [
					{ browser: 'firefox' },
					{ browser: 'chromium' },
					{ browser: 'webkit' },
				],
			},
			expect: {
				requireAssertions: true,
			},
		},
	}));
}

/**
 * Create a Vite/Vitest config for a package with tests running in a node environment only
 * @param pkg the content of the `package.json` for that project
 */
export function getNodeTestConfig(pkg: PackageJSON): UserProjectConfigFn {
	return defineProject(() => ({
		extends: true,
		test: {
			include: [
				'tests/unit/**/*.spec.ts',
			],
			name: `node:${ unscope(pkg.name) }`,
			environment: 'node',
			expect: {
				requireAssertions: true,
			},
		},
	}));
}