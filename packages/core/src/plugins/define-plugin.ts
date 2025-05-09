import { getActiveApp } from '../application/active-app';
import { emitter } from '../emitter';
import { handleError } from '../error-handling';
import { setActivePlugin } from './active-plugin';
import type { DefinedPlugin, PluginId, PluginPhase } from './plugin.type';


/**
 * Describes how a plugin is created.
 */
export type PluginSetup = () => void;

/**
 * A factory function that returns a defined plugin ready to be added to an application.
 *
 * @see definePlugin
 */
export type PluginDefinition = {
	(): DefinedPlugin;
	id: PluginId;
};

/**
 * Define an anonymous plugin using a generated id
 *
 * @param setup the plugin setup function
 */
export function definePlugin(setup: PluginSetup): PluginDefinition;
/**
 * Define a named plugin using a provided id.
 *
 * @param id the name of the plugin to recognize it by in logs, errors and tools. Will be used as the description of
 *   the symbol used for identifying the plugin.
 * @param setup the plugin setup function
 */
export function definePlugin(id: string, setup: PluginSetup): PluginDefinition;
/**
 * Use one of the overloads
 *
 * @param _idOrSetup an id for the (id, setup) overload or a setup function for the (setup) overload
 * @param _setup a setup function for the (id, setup) overload
 *
 * @internal
 */
export function definePlugin(_idOrSetup: PluginSetup | string, _setup?: PluginSetup): PluginDefinition {
	let id: PluginId, setup: PluginSetup;
	if (typeof _idOrSetup === 'string' && typeof _setup === 'function') {
		id = Symbol(_idOrSetup);
		setup = _setup;
	}
	else if (typeof _idOrSetup === 'function' && _setup === undefined) {
		id = Symbol();
		setup = _idOrSetup;
	}
	else {
		throw new TypeError('invalid definePlugin overload usage'); // todo make a better error
	}

	function pluginDefinition(): DefinedPlugin {
		const plugin = {
			id,
			dependencies: [],
			hooks: emitter(),
			phase: 'setup' as PluginPhase,
		} satisfies DefinedPlugin;

		const reset = setActivePlugin(plugin);
		try {
			setup();
		}
		catch (error) {
			handleError(error, plugin, getActiveApp(), 'setup');
		}
		reset();

		return plugin;
	}

	pluginDefinition.id = id;

	return pluginDefinition;
}
