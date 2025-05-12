import type { Emitter } from 'mitt';
import type { _PluginHooks } from './plugin-hooks.type';

/**
 * A plugin's unique identifier.
 *
 * ⚠️ Do not mistake this with {@link definePlugin `definePlugin`}'s `name` parameter.
 *
 * @public
 */
export type PluginId = symbol;
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
 * @see {@link _PluginHooks} for details on the hooks emitted for each transition
 *
 * @public
 */
export type PluginPhase = 'setup' | 'mount' | 'active' | 'teardown' | 'destroyed';
/**
 * An instance of a plugin as returned by a {@link PluginDefinition `PluginDefinition`}.
 * @public
 */
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
	 * @internal
	 */
	hooks: Emitter<_PluginHooks>;
	/**
	 * The current phase of the plugin. Some built-in functions will react differently depending on this value.
	 */
	phase: PluginPhase;
}