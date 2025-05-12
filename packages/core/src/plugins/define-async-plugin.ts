import type { Application } from '../application';
import { handleError } from '../error-handling';
import { getActivePlugin } from './active-plugin';
import { addPlugins } from './add-plugin';
import { toArray } from './array.helper';
import type { PluginDefinition } from './define-plugin';
import { definePlugin } from './define-plugin';
import { onCreated } from './define-plugin-hooks';
import { dependsOn } from './depends-on.composable';
import type { DefinedPlugin, PluginId } from './plugin.type';
import { removePlugin } from './remove-plugin';

export type AsyncPluginErrors = 'asyncPluginCondition' | 'asyncPluginImport'

/**
 * Load a set of plugins in the application when a condition is met
 *
 * @param importer a function to load the plugins asynchronously
 * @param when the condition to await
 * @param dependencies a list of plugins that the condition depends on
 * @param done called once the plugins are added to the app, only used during testing
 *
 * @returns a plugin to set up the condition and load the plugin when it is met
 */
export function defineAsyncPlugin(
	importer: () => Promise<PluginDefinition | PluginDefinition[]>,
	when: (app: Application) => Promise<void>,
	dependencies?: PluginId[],
	done?: (app: Application, plugin: DefinedPlugin) => void,
): PluginDefinition {
	return definePlugin(() => {
		dependencies?.forEach(dependsOn);

		onCreated(app => {
			const plugin = getActivePlugin() as DefinedPlugin;
			const finished = when(app)
				.then(
					importer,
					error => {
						handleError(error as Error | string, plugin, app, 'asyncPluginCondition');
						return [] as PluginDefinition[];
					},
				)
				.then(
					plugins => addPlugins(toArray(plugins), app),
					error => handleError(error as Error | string, plugin, app, 'asyncPluginImport'),
				).then(() => {
					removePlugin(plugin.id, app);
				});
			if (import.meta.env.TEST) {
				finished.finally(() => {
					done?.(app, plugin);
				});
			}
		});
	});
}