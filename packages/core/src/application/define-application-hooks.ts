// oxlint-disable prefer-await-to-callbacks
import { warn } from '../warn.helper';
import { getActiveApp } from './active-app';
import type { ApplicationHooks } from './application.type';

function defineApplicationHook<hook extends keyof ApplicationHooks>(name: hook): (callback: ((payload: ApplicationHooks[hook]) => void)) => void {
	return (callback): void => {
		const app = getActiveApp();
		if (!app) {
			if (import.meta.env.DEV) {
				warn(new Error(`${ name } hook called without an active plugin instance`));
			}
			return;
		}

		app.emitter.on(name, callback);
	};
}

//
// /**
//  * Add a callback to be called between the dependency resolution and adding the plugins to the application
//  */
// export const onBeforeCreate = defineApplicationHook('beforeCreate');

/**
 * Add a callback to be called when a plugin registration fails
 *
 * @see ApplicationHooks#failedPluginRegistration
 */
export const onFailedPluginRegistration = defineApplicationHook('failedPluginRegistration');