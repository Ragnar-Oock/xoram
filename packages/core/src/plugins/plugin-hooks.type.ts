import type { Application, ApplicationPluginEvent } from '../application';

/**
 * Events emitted by the application and relating to plugins
 */
export type ApplicationPluginHooks = {
	/**
	 * Fired before a plugin is added to the application, the plugin is in its {@link PluginPhase `mount` phase} and the
	 * {@link PluginHooks#beforeCreate `beforeCreate` hook} has not been invoked yet.
	 */
	beforePluginRegistration: ApplicationPluginEvent;
	/**
	 * Fired after the transition to the plugin's {@link PluginPhase `active` phase}, after it's
	 * {@link PluginHooks#created `created` hook} has been invoked and the plugin added to the application.
	 */
	pluginRegistered: ApplicationPluginEvent
	/**
	 * Fired after a plugin enters its {@link PluginPhase `teardown` phase} but before it's
	 * {@link PluginHooks#beforeDestroy `beforeDestroyed` hook} is invoked.
	 */
	beforePluginRemoved: ApplicationPluginEvent;
	/**
	 * Fired after the transition to the plugin's {@link PluginPhase `destroyed` phase}, after it's
	 * {@link PluginHooks#destroyed `destroyed` hook} has been invoked and the plugin removed from the application.
	 */
	pluginRemoved: ApplicationPluginEvent;

	/**
	 * Fired after a plugin registration was attempted but could not succeed.
	 *
	 * @see onFailedPluginRegistration
	 */
	failedPluginRegistration: {
		app: Application,
		// plugins: DefinedPlugin[],
		reason: Error,
	};
}
/**
 * Implements life cycles for the plugin.
 *
 * @todo figure out the parameters to pass in and clean up declaration
 */
export type PluginHook = (app: Application) => void;
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