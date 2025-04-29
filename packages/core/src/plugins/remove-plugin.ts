import type { Application } from '../application';
import { getActiveApp } from '../application/active-app';
import { pluginSymbol } from '../application/application.type';
import { playBeforeDestroyHook, playDestroyedHook } from './play-plugin-hook';
import type { DefinedPlugin, PluginId } from './plugin.type';


function getDependents(app: Application, plugin: DefinedPlugin): DefinedPlugin[] {
	const pluginMap = app[pluginSymbol];

	const dependents: DefinedPlugin[] = [plugin];

	for (const registered of pluginMap.values()) {
		if (registered.dependencies.includes(plugin.id)) {
			dependents.unshift(...getDependents(app, registered));
			// check for loops? should not be needed but maybe just to make sure ?
		}
	}

	return dependents;

	/* return pluginMap
	 .values()
	 .filter(({dependencies}) => dependencies.includes(plugin.id))
	 .flatMap(dependent => [...getDependents(app, dependent), dependent])
	 .toArray(); */
}

/**
 * Remove a plugin and all those depending on it in reverse topological order.
 *
 * @param idOrPlugin the plugin to remove or its id
 * @public
 */
export function removePlugin(idOrPlugin: PluginId | DefinedPlugin): void;
/**
 * Remove a plugin and all those depending on it in reverse topological order.
 * @param idOrPlugin the plugin to remove or its id
 * @param app the app to remove the plugin from
 * @public
 */
export function removePlugin(idOrPlugin: PluginId | DefinedPlugin, app: Application): void;
/**
 * Remove a plugin and all those depending on it in reverse topological order.
 *
 * Use one of the overrides
 *
 * @todo make sure we need the plugin parameter signature, remove it if not
 *
 * @param idOrPlugin a plugin id or registered plugin to remove from the active app
 * @param app the app to remove the plugin from
 *
 * @internal
 */
export function removePlugin(idOrPlugin: PluginId | DefinedPlugin, app = getActiveApp()): void {
	if (app === undefined) {
		// todo decide if we throw or not
		throw new Error('removePlugin invoked without application context')
	}
	const id = typeof idOrPlugin === 'symbol' ? app[pluginSymbol].get(idOrPlugin) : idOrPlugin;
	if (id === undefined) {
		console.warn(new Error(`Tried to remove plugin with id "${String(idOrPlugin)}" but it's not registered in the app.`));
		return;
	}

	const dependents = getDependents(app, id);

	dependents
		.map(plugin => playBeforeDestroyHook(app, plugin))
		.map(plugin => playDestroyedHook(app, plugin));
}
