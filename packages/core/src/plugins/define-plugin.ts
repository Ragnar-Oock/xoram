import type { Emitter } from 'mitt';
import mitt from 'mitt';
import { getActiveApp } from '../application';
import type { Application } from '../application/application.type';
import { invokeHookWithErrorHandling } from '../error-handling';


/**
 * Describes how a plugin is created.
 */
export type PluginSetup = () => void;
/**
 * Implements life cycles for the plugin.
 *
 * @todo figure out the parameters to pass in and clean up declaration
 */
export type PluginHook = (app: Application) => void;
export type PluginId = symbol;


/**
 * Used internally to manage plugin life cycle.
 * @internal
 */
export type PluginHooks = {
	setup: never;
	/**
	 * Fires after the transition from the {@link PluginPhase `setup` phase} to the {@link PluginPhase `mount` phase}.
	 *
	 * First hook called in the life cycle of the plugin, right after dependency resolution is done.
	 *
	 * @see onBeforeCreate
	 */
	beforeCreate: Application;
	/**
	 * Fires after the transition from the {@link PluginPhase `mount` phase} to the {@link PluginPhase `active` phase},
	 * once the {@link PluginHooks#beforeCreate `beforeCreate`} hook of all the plugin of a batch have been called.
	 *
	 * At that point all services you might depend on have been registered.
	 *
	 * @see {@link onCreated}
	 */
	created: Application;
	/**
	 * Fires after the transition from the {@link PluginPhase `active` phase} to the {@link PluginPhase `teardown` phase},
	 * before the plugin gets removed from the application.
	 *
	 * @see onBeforeDestroy
	 */
	beforeDestroy: Application;
	/**
	 * Fires after the transition from the {@link PluginPhase `teardown` phase} to the
	 * {@link PluginPhase `destroyed` phase}, after the plugin is removed from the application.
	 *
	 * Used internally for housekeeping and devtools, you MUST not use this hook in your code.
	 *
	 * @internal
	 */
	destroyed: Application;
}
/**
 * The phase of the plugin during it's life cycle, phase transition can only occur in one order and always lead to a
 * hook being played. Phase order is as follows :
 * 1. **setup**: the plugin is getting build, this is when the `setup` function provided to
 * {@link definePlugin `definePlugin`} is invoked.
 * 2. **mount**: the plugin is in the process of registering in the application, this is a transient state
 * 3. **active**: the plugin's main phase where it will stay for the most time
 * 4. **teardown**: the cleanup phase before the plugin is removed from the application
 * 5. **destroyed**: the plugin has been removed from the application, it should not be used anymore and references to
 * it should be removed so it can be garbage collected
 *
 * @see {@link PluginHooks} for details on the hooks emitted for each transition
 *
 */
export type PluginPhase = 'setup' | 'mount' | 'active' | 'teardown' | 'destroyed';

export type DefinedPlugin = {
	/**
	 * Identifies a plugin in an application.
	 * It is used internally to resolve dependencies between plugins.
	 */
	id: PluginId;
	/**
	 * List the other plugins that should be initialized before this one, if they are not part of the
	 * application config, the application will not instantiate.
	 */
	dependencies: PluginId[];
	/**
	 * A Mitt instance to manage the plugin's life cycle hooks
	 */
	hooks: Emitter<PluginHooks>;
	/**
	 * The current phase of the plugin. Some built-in functions will react differently depending on this value.
	 */
	phase: PluginPhase;
}

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

export function pluginId(name = 'plugin'): symbol {
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
	if (typeof _idOrSetup === 'symbol' && typeof _setup === 'function') {
		id = _idOrSetup as PluginId;
		setup = _setup;
	}
	else if (typeof _idOrSetup === 'function' && _setup === undefined) {
		id = pluginId('anonymous');
		setup = _idOrSetup;
	}
	else {
		throw new TypeError('invalid definePlugin overload usage'); // todo make a better error
	}

	function pluginDefinition(): DefinedPlugin {
		const plugin = {
			id,
			dependencies: [],
			hooks: mitt(),
			phase: 'setup' as PluginPhase,
		} satisfies DefinedPlugin;

		setActivePlugin(plugin);
		invokeHookWithErrorHandling(setup, 'setup', plugin, getActiveApp());
		setActivePlugin();

		return plugin;
	}

	pluginDefinition.id = id;

	return pluginDefinition;
}
