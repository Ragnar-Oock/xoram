import type { Application } from '../application';
import { handleError } from '../error-handling';
import { warn } from '../warn.helper';
import { getActivePlugin } from './active-plugin';
import { addPlugins } from './add-plugin';
import { type OneOrMore, toArray } from './array.helper';
import type { PluginDefinition } from './define-plugin';
import { definePlugin } from './define-plugin';
import { onCreated } from './define-plugin-hooks';
import { dependsOn } from './depends-on.composable';
import type { DefinedPlugin, PluginId } from './plugin.type';
import { removePlugin } from './remove-plugin';

/**
 * @internal
 */
export type _AsyncPluginError = {
	/**
	 * sent when the `when` callback of `defineAsyncPlugin` throws synchronously or returns a rejecting promise
	 */
	asyncPluginCondition: never;
	/**
	 * sent when the importer function passed to `defineAsyncPlugin` throw synchronously or returns a rejecting promise
	 */
	asyncPluginImport: never;
}

/**
 * Load a set of plugins in the application when a condition is met
 *
 * @param importer - a function to load the plugins asynchronously
 * @param when - the condition to await
 * @param dependencies - a list of plugins that the condition depends on
 *
 * @returns a plugin to set up the condition and load the plugin when it is met
 *
 * @public
 *
 * {@label DEFINE_ASYNC_PLUGIN}
 */
export function defineAsyncPlugin(
	importer: (app: Application) => Promise<OneOrMore<PluginDefinition>>,
	when: (app: Application) => Promise<void>,
	dependencies?: PluginId[],
): PluginDefinition;

/**
 * Load a set of plugins in the application when a condition is met.
 *
 * This override is only available during testing.
 *
 * @param importer - a function to load the plugins asynchronously
 * @param when - the condition to await
 * @param dependencies - a list of plugins that the condition depends on
 * @param done - called once the plugins are added to the app, only used during testing
 *
 * @internal
 *
 * {@label DEFINE_ASYNC_PLUGIN_INTERNAL}
 */
export function defineAsyncPlugin(
	importer: (app: Application) => Promise<OneOrMore<PluginDefinition>>,
	when: (app: Application) => Promise<void>,
	dependencies?: PluginId[],
	done?: (app: Application, plugin: DefinedPlugin) => void,
): PluginDefinition;

export function defineAsyncPlugin(
	importer: (app: Application) => Promise<OneOrMore<PluginDefinition>>,
	when: (app: Application) => Promise<void>,
	dependencies?: PluginId[],
	done?: (app: Application, plugin: DefinedPlugin) => void,
): PluginDefinition {
	return definePlugin(() => {
		dependencies?.forEach(dependsOn);

		onCreated(app => {
			const plugin = getActivePlugin() as DefinedPlugin;
			const condition = async () => {
				try {
					const maybePromise = when(app);
					if (import.meta.env.DEV && !(maybePromise instanceof Promise)) {
						warn(new Error(
							'defineAsyncPlugin() called with synchronous condition. If you want to load plugins synchronously use addPlugins() instead.'));
					}
					await maybePromise;
				}
				catch (error) {
					handleError(error as Error | string, plugin, app, 'asyncPluginCondition');
					return;
				}

				if (!app.alive || plugin.phase !== 'active') {
					return;
				}

				let plugins: PluginDefinition[];
				try {
					const importResult: OneOrMore<PluginDefinition> | Promise<OneOrMore<PluginDefinition>> = importer(app);

					if (import.meta.env.DEV && !(importResult instanceof Promise)) {
						warn(new Error(
							'defineAsyncPlugin() called with a synchronous importer. This will prevent the plugins added asynchronously from being split into their own chunk when building.'));
					}

					const awaitedImports = await importResult;
					if (import.meta.env.DEV && (awaitedImports === undefined || awaitedImports.length === 0)) {
						warn(new Error('defineAsyncPlugin() received no plugin from the importer, did you forget to return them ?'));
					}
					plugins = toArray(awaitedImports);
				}
				catch (error) {
					handleError(error as Error | string, plugin, app, 'asyncPluginImport');
					plugins = [];
				}
				addPlugins(plugins, app);
				removePlugin(plugin.id, app);
			};

			const isDone = condition();

			if (import.meta.env.DEV) {
				isDone.finally(() => done?.(app, plugin));
			}
		});
	});
}
