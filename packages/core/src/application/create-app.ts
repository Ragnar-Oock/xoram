import { emitter } from '../emitter';
import {
	playBeforeCreateHook,
	playBeforeDestroyHook,
	playCreatedHook,
	playDestroyedHook,
} from '../plugins/play-plugin-hook';
import { sortPluginsByDependencies } from '../plugins/sort';
import { setActiveApp } from './active-app';
import type { Application, ApplicationConfig, ServiceCollection } from './application.type';
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

	const {sorted, aborted} = sortPluginsByDependencies(plugins);

	if (aborted) {
		console.warn(new Error('Application destruction failed', {cause: aborted}))
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
 * @param config application configuration
 *
 * @todo re-evaluate signature of this function (id, plugins, options) might be easier to use
 */
export function createApp(config: ApplicationConfig): Application {
	const {id = `application_${appCount}`, plugins} = config;

	// oxlint-disable-next-line no-magic-numbers
	if (Array.isArray(plugins) && plugins.length === 0 && import.meta.env.DEV) {
		console.warn(`Application "${id}" initialized without plugin, did you forget to provide them ?`);
	}

	const app = Object.seal({
		id,
		emitter: emitter(),
		services: {} as Readonly<ServiceCollection>,
		[pluginSymbol]: new Map(),
	}) satisfies Application

	const resetActiveApp = setActiveApp(app);

	let {sorted, aborted} = sortPluginsByDependencies(plugins.map(setup => setup()));

	if (aborted) {
		throw new Error(`Application creation failed`, {cause: aborted});
	}

	sorted
		.map(plugin => playBeforeCreateHook(app, plugin))
		.map(plugin => playCreatedHook(app, plugin))

	resetActiveApp();

	return app;
}