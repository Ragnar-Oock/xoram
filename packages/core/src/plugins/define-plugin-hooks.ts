import type { Application } from '../application/application.type';
import { getActivePlugin } from './active-plugin';
import type { PluginHooks } from './plugin-hooks.type';

function definePluginHooks(name: keyof PluginHooks): (callback: ((app: Application) => void)) => void {
// oxlint-disable-next-line prefer-await-to-callbacks
  return (callback): void => {
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
export const onBeforeCreate = definePluginHooks('beforeCreate');
/**
 * Add a callback to be called before the plugin is removed from the application
 */
export const onBeforeDestroy = definePluginHooks('beforeDestroy');
/**
 * Add a callback to be called when the plugin is added to the application
 */
export const onCreated = definePluginHooks('created');

