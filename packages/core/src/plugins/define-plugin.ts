import { getActiveApp } from '../application/active-app';
import { emitter } from '../emitter';
import { invokeHookWithErrorHandling } from '../error-handling';
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

let pluginCount = 0;

export function pluginId(name = ''): symbol {
// oxlint-disable-next-line no-magic-numbers
	return Symbol(`${ name }_${ (pluginCount++).toString(32).padStart(4, '0') }`);
}

/**
 * Define an anonymous plugin using a generated id
 *
 * @param setup the plugin setup function
 */
export function definePlugin(setup: PluginSetup): PluginDefinition;
/**
 * Define a named plugin using a provided id.
 *
 * @param id a unique id to reference the plugin by
 * @param setup the plugin setup function
 */
export function definePlugin(id: PluginId, setup: PluginSetup): PluginDefinition;
/**
 * Use one of the overloads
 *
 * @param _idOrSetup an id for the (id, setup) overload or a setup function for the (setup) overload
 * @param _setup a setup function for the (id, setup) overload
 *
 * @internal
 */
export function definePlugin(_idOrSetup: PluginSetup | PluginId, _setup?: PluginSetup): PluginDefinition {
	let id: PluginId, setup: PluginSetup;
	// noinspection SuspiciousTypeOfGuard
	if (typeof _idOrSetup === 'symbol' && typeof _setup === 'function') {
		id = _idOrSetup as PluginId;
		setup = _setup;
	}
	else if (typeof _idOrSetup === 'function' && _setup === undefined) {
		id = pluginId();
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
		invokeHookWithErrorHandling(setup, 'setup', plugin, getActiveApp());
		reset();

		return plugin;
	}

	pluginDefinition.id = id;

	return pluginDefinition;
}
