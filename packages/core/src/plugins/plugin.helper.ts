import type { PluginDefinition } from './define-plugin';

/**
 * Check if something can be assimilated to a PluginDefinition
 * @param candidate
 */
export const isPluginLike = (candidate: unknown): candidate is PluginDefinition => (
	typeof candidate === 'function'
	// @ts-expect-error candidate might be a plugin
	&& typeof candidate.id === 'symbol'
);