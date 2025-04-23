import mitt, {type Emitter} from "mitt";
import type {DefinedPlugin, PluginId} from "./plugins";
import {PluginDefinition} from "./plugins/define-plugin";
import {Service, ServiceId} from "./service";

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
	/**
	 * Fired before a plugin is added to the application, such a plugin has finished its setup phase and if fully defined.
	 */
	beforePluginRegistration: {
		app: Application,
		plugin: DefinedPlugin,
	};

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

	/**
	 * Fired after a plugin has been added to the application, such a plugin has finished its `created` phase.
	 */
	pluginRegistered: {
		app: Application,
		plugin: DefinedPlugin,
	}

	/**
	 * Fired before a plugin's `beforeDestroy` hook. The plugin is still in its `created` phase.
	 */
	beforePluginRemoved: {
		app: Application,
		plugin: DefinedPlugin,
	};

	/**
	 * Fired after the plugin has been removed from the application and after its `destroyed` hook has been invoked.
	 */
	pluginRemoved: {
		app: Application,
		pluginId: PluginId,
	}

}

/**
 * Register your service in this interface by augmenting it
 */

// eslint-disable-next-line no-empty-interface, no-empty-object-type
export interface ServiceCollection {
	// services will be added here by plugins
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
	 * Cleanly destroy the application.
	 */
	destroy(): void;
}

export type ApplicationConfig = {
	id?: string;
	plugins: PluginDefinition[];
}

// region context

export let activeApp: Application | undefined;

/**
 * Set the current application context.
 *
 * Used to scope hooks to the app they are used in.
 *
 * @param app the application to set as active
 *
 * @internal
 */
function setActiveApp(app?: Application): Application | undefined {
	return (activeApp = app);
}

/**
 * Access the current application context
 *
 * @internal
 */
export function getActiveApp(): Application | undefined {
	return activeApp;
}

// endregion

// region plugin sort
export type PluginSortingResult = Readonly<{
	/**
	 * The sorted list of plugins
	 */
	sorted: DefinedPlugin[];
	/**
	 * The sorting wasn't aborted.
	 */
	aborted: false;
} | {
	/**
	 * Empty array to avoid fallbacks all over the place.
	 */
	sorted: never[];
	/**
	 * The reason why the sorting was aborted.
	 */
	aborted: Error;
}>

/**
 * Topologically sort plugins by their dependencies.
 * @param plugins plugins to sort by dependencies
 * @param existingPlugins plugins to consider already registered, those plugins can be used as dependencies by the plugins from `plugin`
 *
 * @internal
 */
export function sortPluginsByDependencies(plugins: DefinedPlugin[], existingPlugins?: Map<PluginId, DefinedPlugin>): PluginSortingResult {
	const sorted: DefinedPlugin[] = [];
	const unmarked: DefinedPlugin[] = [...plugins];
	const map = new Map<PluginId, DefinedPlugin>(existingPlugins?.entries());
	const temporarilyMarked = new Set<PluginId>();
	const permanentlyMarked = new Set<PluginId>(map.keys());

	let aborted: false | Error = false;

	unmarked.forEach(plugin => map.set(plugin.id, plugin));

	/**
	 * @param plugin the plugin to check dependencies of
	 */
	function visit(plugin: DefinedPlugin): void {
		const pluginId = plugin.id;
		if (permanentlyMarked.has(pluginId)) {
			return;
		}
		if (temporarilyMarked.has(pluginId)) {
			// todo list dependency cycle
			aborted = new Error(`The plugin "${String(pluginId)}" declares a dependency that directly or indirectly depends on it.`);
			return;
		}
		temporarilyMarked.add(pluginId);
		for (const dependencyId of plugin.dependencies) {
			const dependency = map.get(dependencyId);

			if (dependency === undefined) {
				aborted = new Error(`The plugin "${String(pluginId)}" depends on "${String(dependencyId)}" but it is not in the list of provided plugins. Did you forget to register it ?`);
				break;
			}

			visit(dependency);
		}
		temporarilyMarked.delete(pluginId);
		permanentlyMarked.add(pluginId);
		sorted.push(plugin);
	}

	for (const definedPlugin of unmarked) {
		visit(definedPlugin);
	}

	return {
		sorted,
		aborted
	} as Readonly<PluginSortingResult>;
}

// endregion

export const pluginSymbol = Symbol('plugin-list');
export const serviceSymbol = Symbol('service-list');

let appCount = 0;

function destroyApp(app: Application): void {
	const plugins = [...app[pluginSymbol].values()];

	const {sorted, aborted} = sortPluginsByDependencies(plugins);

	if (aborted) {
		console.warn('Application destruction failed', { cause: aborted })
		return;
	}

	const pluginsToDestroy = sorted.reverse();

	pluginsToDestroy.forEach(plugin => {
		plugin.destroy(app);
	})
}

/**
 * Create an application from a set of plugins
 *
 * @param config application configuration
 *
 * @todo re-evaluate signature of this function (id, plugins, options) might be easier to use
 */
export function createApp(config: ApplicationConfig): Application {
	const {id = `application_${appCount}`, plugins} = config;

	// eslint-disable-next-line no-magic-numbers
	if (Array.isArray(plugins) && plugins.length === 0 && import.meta.env.DEV) {
		console.warn(`Application "${id}" initialized without plugin, did you forget to provide them ?`);
	}

	const app = Object.seal({
		id,
		emitter: mitt(),
		services: {} as Readonly<ServiceCollection>,
		[pluginSymbol]: new Map(),
		destroy: () => {
			destroyApp(app);
		},
	}) satisfies Application

	setActiveApp(app);

	let {sorted, aborted} = sortPluginsByDependencies(plugins.map(setup => setup()));

	if (aborted) {
		throw new Error(`Application creation failed`, {cause: aborted});
	}

	sorted
		.map(plugin => {
			plugin.hooks.emit('beforeCreate', app);
			return plugin;
		})
		.map(plugin => {
			app[pluginSymbol].set(plugin.id, plugin);
			plugin.hooks.emit('created', app);
			return plugin;
		})

	setActiveApp();

	return app;
}
