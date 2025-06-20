import type { Application } from '../application/application.type';
import { warn } from '../warn.helper';
import { getActivePlugin } from './active-plugin';
import type { _PluginHooks } from './plugin-hooks.type';
import { beforeCreate, beforeDestroy, created } from './plugin-hooks.type';

function definePluginHooks(name: keyof _PluginHooks): (callback: ((app: Application) => void)) => void {
// oxlint-disable-next-line prefer-await-to-callbacks
	return (callback): void => {
		const plugin = getActivePlugin();
		if (!plugin) {
			if (import.meta.env.DEV) {
				warn(new Error(`${ name } hook called without an active plugin instance`));
			}
			return;
		}

		plugin.hooks.on(name, callback);
	};
}

/**
 * Add a callback to be called between the dependency resolution and adding the plugins to the application
 *
 * @public
 * @see https://xoram.dev/guide/concepts-in-depth/life-cycle
 */
export const onBeforeCreate = definePluginHooks(beforeCreate);
/**
 * Add a callback to be called before the plugin is removed from the application
 *
 * @public
 * @see https://xoram.dev/guide/concepts-in-depth/life-cycle
 */
export const onBeforeDestroy = definePluginHooks(beforeDestroy);
/**
 * Add a callback to be called when the plugin is added to the application
 *
 * @public
 * @see https://xoram.dev/guide/concepts-in-depth/life-cycle
 */
export const onCreated = definePluginHooks(created);
