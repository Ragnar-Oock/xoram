import type { Emitter } from 'mitt';
import type { DefinedPlugin, PluginId } from '../plugins';
import type { PluginDefinition } from '../plugins/define-plugin';
import type { Service, ServiceId } from '../service';

export type ApplicationPluginEvent = {
	/**
	 * The application that emitted the event and that is set as a context for the plugin to use.
	 */
	app: Application,
	/**
	 * The plugin that triggered the event.
	 */
	plugin: DefinedPlugin,
}

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

export type ApplicationHooks = {
	/**
	 * Fired before a service is added to the application
	 *
	 * @todo make it preventable ?
	 */
	beforeServiceAdded: {
		app: Application,
		service: Service,
	};
	/**
	 * Fired when a service has been added to the application
	 */
	serviceAdded: {
		app: Application,
		service: Service,
	};
	/**
	 * Fired before a service is removed from the application, can be used to do some cleanup.
	 */
	beforeServiceRemoved: {
		app: Application,
		id: ServiceId,
		service: Service,
	};
	/**
	 * Fired after the service has been removed from the application
	 */
	serviceRemoved: {
		app: Application,
		id: ServiceId,
	};

} & ApplicationPluginHooks;

/**
 * Register your service in this interface by augmenting it
 */

// oxlint-disable-next-line no-empty-interface, no-empty-object-type
export interface ServiceCollection {
	// services will be added here by plugins
}

export const pluginSymbol = Symbol('plugin-list');
export const serviceSymbol = Symbol('service-list');
export type Application = {
	/**
	 * The name of the application, will be useful when debugging if you have more than one
	 * application in a given environment.
	 * @public
	 */
	readonly id: string;
	/**
	 * The application's own event emitter used to broadcast its life cycle events.
	 *
	 * @internal
	 */
	readonly emitter: Emitter<ApplicationHooks>;
	/**
	 * The services registered on the application, usable by plugins.
	 */
	readonly services: Readonly<ServiceCollection>;

	/**
	 * All the plugins loaded in the application.
	 *
	 * @internal
	 */
	[pluginSymbol]: Map<PluginId, DefinedPlugin>;

	/**
	 * Cleanly destroy the application.
	 */
	destroy(): void;
}

export type ApplicationConfig = {
	id?: string;
	plugins: PluginDefinition[];
}

// region context

// endregion


