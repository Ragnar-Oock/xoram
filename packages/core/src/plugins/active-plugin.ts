import type { DefinedPlugin } from './plugin.type';

let activePlugin: DefinedPlugin | undefined;

/**
 * @param plugin the plugin to set as the active context
 * @internal
 */
export const setActivePlugin = (plugin: DefinedPlugin): () => void => {
	const previous = activePlugin;
	activePlugin = plugin;
	return () => activePlugin = previous;
};

/**
 * @internal
 */
export const getActivePlugin = (): DefinedPlugin | undefined => activePlugin;