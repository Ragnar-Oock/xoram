import type { Application } from '../application';
import { setActiveApp } from '../application/active-app';
import { pluginSymbol } from '../application/application.type';
import { invokeHookWithErrorHandling } from '../error-handling';
import type { DefinedPlugin } from './define-plugin';
import { setActivePlugin } from './define-plugin';

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
	setActiveApp(app);
	setActivePlugin(plugin);

	plugin.phase = 'mount';
	invokeHookWithErrorHandling(() => app.emitter.emit('beforePluginRegistration', {app, plugin}), 'beforePluginRegistration', plugin, app);
	invokeHookWithErrorHandling(() => plugin.hooks.emit('beforeCreate', app), 'beforeCreate', plugin, app);
	plugin.hooks.off('beforeCreate');

	setActivePlugin();
	setActiveApp();

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
	setActiveApp(app);
	setActivePlugin(plugin);

	app[pluginSymbol].set(plugin.id, plugin);
	plugin.phase = 'active';
	invokeHookWithErrorHandling(() => plugin.hooks.emit('created', app), 'created', plugin, app);
	plugin.hooks.off('created');
	invokeHookWithErrorHandling(() => app.emitter.emit('pluginRegistered', {app, plugin}), 'pluginRegistered', plugin, app);

	setActivePlugin();
	setActiveApp();

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
	setActiveApp(app);
	setActivePlugin(plugin);

	plugin.phase = 'teardown';
	invokeHookWithErrorHandling(() => app.emitter.emit('beforePluginRemoved', {app, plugin}), 'beforePluginRemoved', plugin, app);
	invokeHookWithErrorHandling(() => plugin.hooks.emit('beforeDestroy', app), 'beforeDestroy', plugin, app);
	plugin.hooks.off('beforeDestroy');

	setActivePlugin();
	setActiveApp();

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
	setActiveApp(app);
	setActivePlugin(plugin);

	app[pluginSymbol].delete(plugin.id);
	plugin.phase = 'destroyed';
	invokeHookWithErrorHandling(() => plugin.hooks.emit('destroyed', app), 'destroyed', plugin, app);
	plugin.hooks.off('destroyed');
	invokeHookWithErrorHandling(() => app.emitter.emit('pluginRemoved', {app, plugin}), 'pluginRemoved', plugin, app);

	setActivePlugin();
	setActiveApp();

	return plugin;
}