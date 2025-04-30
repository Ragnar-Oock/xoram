import type { Emitter } from 'mitt';
import type { ApplicationPluginHooks, DefinedPlugin, PluginId } from '../plugins';
import type { ApplicationServiceHooks } from '../services/services.type';

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

export type ApplicationHooks = ApplicationServiceHooks & ApplicationPluginHooks;

/**
 * Register your service in this interface by augmenting it
 */

// oxlint-disable-next-line no-empty-interface, no-empty-object-type
export interface ServiceCollection {
	// services will be added here by plugins
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
	 * @param error
	 */
	onError: (error: unknown) => void;
}

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
}
