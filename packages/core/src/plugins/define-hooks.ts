import {Application} from "../application";
import {getActivePlugin, type PluginHooks} from "../plugin";

function defineHooks(name: keyof PluginHooks): (callback: ((app: Application) => void)) => void {
  return callback => {
    const plugin = getActivePlugin();
    if (!plugin) {
      if (import.meta.env.DEV) {
        console.error(new Error(`${name} hook called without an active plugin instance`));
      }
      return;
    }

    plugin.hooks.on(name, callback);
  }
}

/**
 * Add a callback to be called between the dependency resolution and adding the plugins to the application
 */
export const onBeforeCreate = defineHooks('beforeCreate');
/**
 * Add a callback to be called before the plugin is removed from the application
 */
export const onBeforeDestroy = defineHooks('beforeDestroy');
/**
 * Add a callback to be called when the plugin is added to the application
 */
export const onCreated = defineHooks('created');

