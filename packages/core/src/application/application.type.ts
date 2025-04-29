import type { Emitter } from 'mitt';
import type { ApplicationPluginHooks, DefinedPlugin, PluginId } from '../plugins';
import type { PluginDefinition } from '../plugins/define-plugin';
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


