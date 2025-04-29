import type { DefinedPlugin } from './plugin.type';

let activePlugin: DefinedPlugin | undefined;

/**
 * @param plugin the plugin to set as the active context
 * @internal
 */
export function setActivePlugin(plugin?: DefinedPlugin): DefinedPlugin | undefined {
	return (activePlugin = plugin);
}

/**
 * @internal
 */
export function getActivePlugin(): DefinedPlugin | undefined {
	return activePlugin;
}