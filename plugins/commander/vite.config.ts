import type { UserProjectConfigFn } from 'vitest/config';
import { defineProject, mergeConfig } from 'vitest/config';
import { defineLibConfig } from '../../config/vite/vite.config';
import { getNodeTestConfig } from '../../config/vite/vitest.config';
import pkg from './package.json' with { type: 'json' };

export default defineProject(env =>
	mergeConfig(
		mergeConfig(
			defineLibConfig(pkg)(env),
			getNodeTestConfig(pkg)(env),
		),
		{
			define: {
				'__VUE_OPTIONS_API__': false,
				'__VUE_PROD_DEVTOOLS__': false,
				'__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false,
			},
		},
	),
) as UserProjectConfigFn;