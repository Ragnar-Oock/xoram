import type { Application, ApplicationPluginLifeCycleEvent } from '../application';

/**
 * Plugin related hooks emitted by the application.
 *
 * @public
 */
export type ApplicationPluginHooks = {
	/**
	 * Fired before a plugin is added to the application, the plugin is in its {@link _PluginPhase | `mount` phase} and
	 * the
	 * {@link _PluginHooks#beforeCreate | `beforeCreate` hook} has not been invoked yet.
	 *
	 * @eventProperty
	 */
	beforePluginRegistration: ApplicationPluginLifeCycleEvent;
	/**
	 * Fired after the transition to the plugin's {@link _PluginPhase | `active` phase}, after it's
	 * {@link _PluginHooks#created | `created` hook} has been invoked and the plugin added to the application.
	 * @eventProperty
	 */
	pluginRegistered: ApplicationPluginLifeCycleEvent
	/**
	 * Fired after a plugin enters its {@link _PluginPhase | `teardown` phase} but before it's
	 * {@link _PluginHooks#beforeDestroy | `beforeDestroyed` hook} is invoked.
	 * @eventProperty
	 */
	beforePluginRemoved: ApplicationPluginLifeCycleEvent;
	/**
	 * Fired after the transition to the plugin's {@link _PluginPhase | `destroyed` phase}, after it's
	 * {@link _PluginHooks#destroyed | `destroyed` hook} has been invoked and the plugin removed from the application.
	 * @eventProperty
	 */
	pluginRemoved: ApplicationPluginLifeCycleEvent;

	/**
	 * Fired after a plugin registration was attempted but could not succeed.
	 * @eventProperty
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
 * Used internally to manage plugin life cycle.
 * @internal
 *
 * @see https://zoram.dev/guide/concepts-in-depth/life-cycle
 */
export type _PluginHooks = {
	setup: never;
	/**
	 * Fires after the transition from the {@link _PluginPhase | `setup` phase} to the {@link _PluginPhase | `mount`
	 * phase}.
	 *
	 * First hook called in the life cycle of the plugin, right after dependency resolution is done.
	 *
	 * @see onBeforeCreate
	 * @eventProperty
	 */
	beforeCreate: Application;
	/**
	 * Fires after the transition from the {@link _PluginPhase | `mount` phase} to the {@link _PluginPhase | `active`
	 * phase}, once the {@link _PluginHooks.beforeCreate | `beforeCreate`} hook of all the plugin of a batch have been
	 * called.
	 *
	 * At that point all services you might depend on have been registered.
	 *
	 * @see onCreated
	 * @eventProperty
	 */
	created: Application;
	/**
	 * Fires after the transition from the {@link _PluginPhase | `active` phase} to the
	 * {@link _PluginPhase | `teardown` phase}, before the plugin gets removed from the application.
	 *
	 * @see onBeforeDestroy
	 * @eventProperty
	 */
	beforeDestroy: Application;
	/**
	 * Fires after the transition from the {@link _PluginPhase | `teardown` phase} to the
	 * {@link _PluginPhase | `destroyed` phase}, after the plugin is removed from the application.
	 *
	 * Used internally for housekeeping and devtools, you MUST not use this hook in your code.
	 *
	 * @internal
	 * @eventProperty
	 */
	destroyed: Application;
}


/* @internal */
export const beforeCreate = 'beforeCreate';
/* @internal */
export const created = 'created';
/* @internal */
export const beforeDestroy = 'beforeDestroy';
/* @internal */
export const destroyed = 'destroyed';