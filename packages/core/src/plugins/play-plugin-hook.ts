import type { Application } from '../application';
import { setActiveApp } from '../application/active-app';
import { pluginSymbol } from '../application/application.type';
import { setActivePlugin } from './active-plugin';
import type { DefinedPlugin } from './plugin.type';

/**
 * A hook invocation plays out like this :
 * 1. set the active application and plugin
 * 2. update the application if needed
 * 3. update the plugin phase
 * 4. update other plugin stuff if needed
 * 5. safely emit events in the appropriate order of each hook
 * 6. unset the active application and plugin
 * 7. return the plugin instance
 */

/**
 *
 * @param app the application to use as context
 * @param plugin the plugin to play the hook of
 *
 * @internal
 */
export function playBeforeCreateHook(app: Application, plugin: DefinedPlugin): DefinedPlugin {
	const resetActiveApp = setActiveApp(app);
	setActivePlugin(plugin);

	plugin.phase = 'mount';
	app.emitter.emit('beforePluginRegistration', {app, plugin});
	plugin.hooks.emit('beforeCreate', app);
	plugin.hooks.off('beforeCreate');

	setActivePlugin();
	resetActiveApp();

	return plugin;
}

/**
 *
 * @param app the application to use as context
 * @param plugin the plugin to play the hook of
 *
 * @internal
 */
export function playCreatedHook(app: Application, plugin: DefinedPlugin): DefinedPlugin {
	const resetActiveApp = setActiveApp(app);
	setActivePlugin(plugin);

	app[pluginSymbol].set(plugin.id, plugin);
	plugin.phase = 'active';
	plugin.hooks.emit('created', app);
	plugin.hooks.off('created');
	app.emitter.emit('pluginRegistered', {app, plugin});

	setActivePlugin();
	resetActiveApp();

	return plugin;
}

/**
 *
 * @param app the application to use as context
 * @param plugin the plugin to play the hook of
 *
 * @internal
 */
export function playBeforeDestroyHook(app: Application, plugin: DefinedPlugin): DefinedPlugin {
	const resetActiveApp = setActiveApp(app);
	setActivePlugin(plugin);

	plugin.phase = 'teardown';
	app.emitter.emit('beforePluginRemoved', {app, plugin});
	plugin.hooks.emit('beforeDestroy', app);
	plugin.hooks.off('beforeDestroy');

	setActivePlugin();
	resetActiveApp();

	return plugin;
}

/**
 *
 * @param app the application to use as context
 * @param plugin the plugin to play the hook of
 *
 * @internal
 */
export function playDestroyedHook(app: Application, plugin: DefinedPlugin): DefinedPlugin {
	const resetActiveApp = setActiveApp(app);
	setActivePlugin(plugin);

	app[pluginSymbol].delete(plugin.id);
	plugin.phase = 'destroyed';
	plugin.hooks.emit('destroyed', app);
	plugin.hooks.off('destroyed');
	app.emitter.emit('pluginRemoved', {app, plugin});

	setActivePlugin();
	resetActiveApp();

	return plugin;
}