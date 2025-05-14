import type { Emitter } from 'mitt';
import type { _PluginHooks } from './plugin-hooks.type';

/**
 * A plugin's unique identifier.
 *
 * ⚠️ Do not mistake this with {@link (definePlugin:2) | definePlugin}  `name` parameter.
 *
 * @public
 */
export type PluginId = symbol;
/**
 * The phase of the plugin during it's life cycle, phase transition can only occur in one order and always lead to a
 * hook being played. Phase order is as follows :
 * 1. **setup**: the plugin is getting build, this is when the `setup` function provided to
 * {@link (definePlugin:1)} is invoked.
 * 2. **mount**: the plugin is in the process of registering in the application, this is a transient state. Entering
 * this phase triggers the {@link _PluginHooks.beforeCreate | beforeCreate hook}, you can subscribe to it by calling
 * {@link onBeforeCreate}.
 * 3. **active**: the plugin's main phase, a plugin in this phase is fully ready to do its job. Entering this phase
 * triggers the {@link _PluginHooks.created | created hook}, you can subscribe to it by calling
 * {@link onCreated}.
 * 4. **teardown**: the plugin's removal from the app has started (either from the app being torn down by
 * {@link destroyApp} or by the plugin itself being removed by {@link (removePlugin:1)}).
 * Entering this phase triggers the {@link _PluginHooks.beforeDestroy}, you can subscribe to it by
 * calling {@link onBeforeDestroy}. During this phase event listeners added by
 * {@link (onEvent:1)} and services registered by {@link (addService:1)} are being removed
 * automatically.
 * 5. **destroyed**: the plugin has been removed from the application, it should not be used anymore and references
 * to it should be removed so it can be garbage collected.
 *
 * @see {@link _PluginHooks} for a listing of all the hooks emitted by a plugin.
 *
 * @internal
 */
export type _PluginPhase = 'setup' | 'mount' | 'active' | 'teardown' | 'destroyed';
/**
 * An instance of a plugin as returned by a {@link PluginDefinition | `PluginDefinition`}.
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
	 * @internal
	 */
	phase: _PluginPhase;
}