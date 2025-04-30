import { emitter } from '../emitter';
import { handleError } from '../error-handling';
import type { PluginDefinition } from '../plugins';
import {
	playBeforeCreateHook,
	playBeforeDestroyHook,
	playCreatedHook,
	playDestroyedHook,
} from '../plugins/play-plugin-hook';
import { sortPluginsByDependencies } from '../plugins/sort';
import { warn } from '../warn.helper';
import { setActiveApp } from './active-app';
import type { Application, ApplicationOptions, ServiceCollection } from './application.type';
import { pluginSymbol } from './application.type';

let appCount = 0;

/**
 * Tear down an application and it's plugins
 *
 * @param app the application to destroy
 *
 * @public
 */
export function destroyApp(app: Application): void {
	const plugins = [...app[pluginSymbol].values()];

	const [sorted, aborted] = sortPluginsByDependencies(plugins);

	if (aborted) {
		// todo check if this can occur in normal use and remove it or change the message if it can't
		handleError(new Error('Application destruction failed', {cause: aborted}), undefined, app);
		return;
	}

	const pluginsToDestroy = sorted.reverse();

	pluginsToDestroy
		.map(plugin => playBeforeDestroyHook(app, plugin))
		.map(plugin => playDestroyedHook(app, plugin));
}

/**
 * Create an application from a set of plugins
 *
 * @param plugins the plugin list to create the application from
 * @param options a set of options to configure how the application functions
 *
 * @public
 */
export function createApp(plugins: PluginDefinition[], options: Partial<ApplicationOptions> = {}): Application {
	const {id = `app_${appCount}`} = options;

	if (plugins.length === 0 && import.meta.env.DEV) {
		warn(`Application "${id}" initialized without plugin, did you forget to provide them ?`);
	}

	const app = Object.seal({
		id,
		emitter: emitter(),
		services: {} as Readonly<ServiceCollection>,
		[pluginSymbol]: new Map(),
		options
	}) satisfies Application

	const resetActiveApp = setActiveApp(app);

	let [sorted, aborted] = sortPluginsByDependencies(plugins.map(setup => setup()));

	if (aborted) {
		throw new Error(`Application creation failed`, {cause: aborted});
	}

	sorted
		.map(plugin => playBeforeCreateHook(app, plugin))
		.map(plugin => playCreatedHook(app, plugin))

	resetActiveApp();

	return app;
}