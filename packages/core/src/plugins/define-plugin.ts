import { getActiveApp } from '../application/active-app';
import { emitter } from '../emitter';
import { handleError } from '../error-handling';
import { setActivePlugin } from './active-plugin';
import type { _PluginPhase, DefinedPlugin, PluginId } from './plugin.type';


/**
 * Describes how a plugin is created.
 *
 * @public
 */
export type PluginSetup = () => void;

/**
 * A factory function that returns a defined plugin ready to be added to an application.
 *
 * Created by calling {@link (definePlugin:1) | definePlugin(setup)} or
 * {@link (definePlugin:2) | definePlugin(id, setup)}
 *
 * @see definePlugin
 *
 * @public
 */
export type PluginDefinition = {
	(): DefinedPlugin;
	id: PluginId;
};

/**
 * Define an anonymous plugin using a generated id
 *
 * @param setup - the plugin setup function
 *
 * @public
 */
export function definePlugin(setup: PluginSetup): PluginDefinition;
/**
 * Define a named plugin using a provided name.
 *
 * @param name - the name of the plugin to recognize it by in logs, errors and tools. Will be used as the description of
 *   the symbol used for identifying the plugin.
 * @param setup - the plugin setup function
 *
 * @public
 */
export function definePlugin(name: string, setup: PluginSetup): PluginDefinition;

export function definePlugin(_nameOrSetup: PluginSetup | string, _setup?: PluginSetup): PluginDefinition {
	let id: PluginId, setup: PluginSetup;
	if (typeof _nameOrSetup === 'string' && typeof _setup === 'function') {
		id = Symbol(_nameOrSetup);
		setup = _setup;
	}
	else if (typeof _nameOrSetup === 'function' && _setup === undefined) {
		id = Symbol();
		setup = _nameOrSetup;
	}
	else {
		throw new TypeError('invalid definePlugin overload usage'); // todo make a better error
	}

	function pluginDefinition(): DefinedPlugin {
		const plugin = {
			id,
			dependencies: [],
			hooks: emitter(),
			phase: 'setup' as _PluginPhase,
		} satisfies DefinedPlugin;

		const reset = setActivePlugin(plugin);
		try {
			setup();
		}
		catch (error) {
			handleError(error as Error | string, plugin, getActiveApp(), 'setup');
		}
		reset();

		return plugin;
	}

	pluginDefinition.id = id;

	return pluginDefinition;
}
