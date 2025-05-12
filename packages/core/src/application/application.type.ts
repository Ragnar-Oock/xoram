import type { Emitter } from 'mitt';
import type { ApplicationPluginHooks, DefinedPlugin, PluginId } from '../plugins';
import type { ApplicationServiceHooks, Service } from '../services/services.type';

/**
 * @public
 */
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
/**
 * @public
 */
export type ApplicationHooks = ApplicationServiceHooks & ApplicationPluginHooks;

/**
 * Register your service in this interface by augmenting it
 * @public
 */
// oxlint-disable-next-line no-empty-interface, no-empty-object-type
export interface ServiceCollection {
	// services will be added here by plugins
	[id: string | symbol]: Service;
}

export const pluginSymbol = Symbol('plugins');
export const serviceSymbol = Symbol('services');
/**
 * Optional configuration options for an application.
 * @public
 */
export type ApplicationOptions = {
	/**
	 * A name to identify an application in error messages and dev tools.
	 */
	id: string;
	/**
	 * Invoked when an error is caught by the application.
	 * @param error - the error that got caught, should be an Error object, but could be anything if you use third party
	 *   libs or throw random stuff yourself
	 */
	onError: (error: unknown) => void;
}

/**
 * An application instance as returned by {@link import('@zoram/core').createApp `createApp`}.
 *
 * @public
 */
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
	 * The `options` parameter as passed to {@link import('@zoram/core').createApp `createApp`}
	 */
	readonly options: Partial<ApplicationOptions>;

	/**
	 * Is the application still active ?
	 */
	alive: boolean;
}
