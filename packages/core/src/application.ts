import mitt, {type Emitter} from "mitt";
import type {DefinedPlugin, PluginId} from "./plugins";

export type ApplicationHooks = {
	/**
	 * Fired before a service is added to the application
	 *
	 * @todo make it preventable ?
	 */
	beforeAddService: Application;
	/**
	 * Fired when a service has been added to the application
	 */
	serviceAdded: Application;
}

/**
 * Register your service in this interface by augmenting it
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
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
	plugins: (() => DefinedPlugin)[];
}

// region context

export let activeApp: Application | undefined;

const setActiveApp = (app?: Application) => (activeApp = app);
export const getActiveApp = () => activeApp;

// endregion

// region plugin sort
function sortPluginsByDependencies(plugins: DefinedPlugin[]): DefinedPlugin[] {
	const sorted: DefinedPlugin[] = [];
	const unmarked: DefinedPlugin[] = [...plugins];
	const map = new Map(unmarked.map(plugin => [plugin.id, plugin] as const));
	const temporarilyMarked = new Set<DefinedPlugin>();
	const permanentlyMarked = new Set<DefinedPlugin>();

	const visit = (plugin: DefinedPlugin): void => {
		if (permanentlyMarked.has(plugin)) {
			return;
		}
		if (temporarilyMarked.has(plugin)) {
			// todo list dependency cycle
			throw new Error(`The plugin "${String(plugin.id)}" declares a dependency that directly or indirectly depends on it.`)
		}
		temporarilyMarked.add(plugin);
		plugin.dependencies?.forEach(dependencyId => {
			const dependency = map.get(dependencyId);

			if (dependency !== undefined) {
				return visit(dependency);
			}
			else {
				throw new Error(`The plugin "${String(plugin.id)}" depends on "${String(dependencyId)}" but it is not in the list of provided plugins. Did you forget to register it ?`)
			}
		})
		temporarilyMarked.delete(plugin);
		permanentlyMarked.add(plugin);
		sorted.push(plugin);
	}

	for (const definedPlugin of unmarked) {
		visit(definedPlugin);
	}

	return sorted;
}
// endregion

export const pluginSymbol = Symbol('plugin-list');
export const serviceSymbol = Symbol('service-list');

let appCount = 0;

function destroyApp(app: Application): void {
	const plugins = [...app[pluginSymbol].values()];

	const pluginsToDestroy = sortPluginsByDependencies(plugins).reverse();

	pluginsToDestroy.forEach(plugin => {
		plugin.destroy(app);
	})
}

/**
 * Create an application from a set of plugins
 *
 * @todo re-evaluate signature of this function (id, plugins, options) might be easier to use
 * @param config
 */
export function createApp(config: ApplicationConfig): Application {
	const { id = `application_${appCount}`, plugins } = config;

	if (Array.isArray(plugins) && plugins.length === 0) {
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

	sortPluginsByDependencies(plugins.map(setup => setup()))
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
