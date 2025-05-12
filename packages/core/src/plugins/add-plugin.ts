import { getActiveApp } from '../application/active-app';
import type { Application } from '../application/application.type';
import { pluginSymbol } from '../application/application.type';
import { warn } from '../warn.helper';
import { type PluginDefinition } from './define-plugin';
import { playBeforeCreateHook, playCreatedHook } from './play-plugin-hook';
import { isPluginLike } from './plugin.helper';
import { sortPluginsByDependencies } from './sort';

/**
 * Register a set of plugins into the active application after it has been initialized.
 *
 * @param definePlugins - the plugin definitions to register in the application
 *
 * @public
 */
export function addPlugins(definePlugins: PluginDefinition[]): void;
/**
 * Register a set of plugins into the active application after it has been initialized.
 *
 * @param definePlugins - the plugin definitions to register in the application
 * @param app - the application to register the plugin into, you should not need to pass this argument in normal use
 *
 * @public
 */
export function addPlugins(definePlugins: PluginDefinition[], app: Application): void;
/**
 * Register a set of plugins into the active application after it has been initialized.
 *
 * @param definePlugins - the plugin definitions to register in the application
 * @param app - the application to register the plugin into, you should not need to pass this argument in normal use
 *
 * @internal
 */
export function addPlugins(definePlugins: PluginDefinition[], app = getActiveApp()): void {
	if (!app) {
		throw new TypeError('addPlugin called outside of an application context and no app instance passed as parameter.'); // todo handle that better
	}

	const pluginCollection = app[pluginSymbol];

	const plugins = definePlugins
		.filter(definition => {
			const isPlugin = isPluginLike(definition);
			if (import.meta.env.DEV && !isPlugin) {
				warn('addPlugin() was passed a non plugin item', definition);
			}
			return isPlugin;
		})
		.map(setup => setup());
	const [ sorted, aborted ] = sortPluginsByDependencies(plugins, pluginCollection);

	if (aborted) {
		if (import.meta.env.DEV) {
			warn(aborted);
		}
		app.emitter.emit('failedPluginRegistration', { app, reason: aborted });
		return;
	}

	sorted
		.map(plugin => playBeforeCreateHook(app, plugin))
		.map(plugin => playCreatedHook(app, plugin));
}

/**
 * Register a plugin into the active application after it has been initialized.
 *
 * @param definePlugin - the plugin definition to register in the application.
 *
 * @public
 */
export function addPlugin(definePlugin: PluginDefinition): void;
/**
 * Register a plugin into the active application after it has been initialized.
 *
 * @param definePlugin - the plugin definition to register in the application.
 * @param app - the application to register the plugin into, you should not need to pass this argument in normal use
 *
 * @public
 */
export function addPlugin(definePlugin: PluginDefinition, app: Application): void;
/**
 * use one of the overrides
 *
 * @param definePlugin - the plugin to add
 * @param app - the app context to use
 *
 * @internal
 *
 */
export function addPlugin(definePlugin: PluginDefinition, app = getActiveApp()): void {
	addPlugins([ definePlugin ], app as Application);
}