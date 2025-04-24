import {Application, pluginSymbol, setActiveApp} from "../application";
import {DefinedPlugin} from "./define-plugin";

/**
 * A hook invocation plays out like this :
 * 1. set the active application
 * 2. update the application if needed
 * 3. update the plugin phase
 * 4. update other plugin stuff if needed
 * 5. emit events in the appropriate order of each hook
 * 6. unset the active application
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

	plugin.phase = 'mount';
	app.emitter.emit('beforePluginRegistration', {app, plugin})
	plugin.hooks.emit('beforeCreate', app);

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

	app[pluginSymbol].set(plugin.id, plugin);
	plugin.phase = 'active';
	plugin.hooks.emit('created', app);
	app.emitter.emit('pluginRegistered', {app, plugin})

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

	plugin.phase = 'teardown';
	app.emitter.emit('beforePluginRemoved', {app, plugin});
	plugin.hooks.emit('beforeDestroy', app);

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

	app[pluginSymbol].delete(plugin.id);
	plugin.phase = 'destroyed';
	plugin.hooks.emit('destroyed', app);
	app.emitter.emit('pluginRemoved', {app, plugin});

	setActiveApp();

	return plugin;
}