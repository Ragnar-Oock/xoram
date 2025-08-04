import { defineProject, mergeConfig } from 'vitest/config';
import { defineLibConfig } from '../../config/vite/vite.config';
import { getNodeTestConfig } from '../../config/vite/vitest.config';
import pkg from './package.json' with { type: 'json' };

export default defineProject(env =>
	mergeConfig(
		defineLibConfig(pkg)(env),
		getNodeTestConfig(pkg)(env)
	)
);