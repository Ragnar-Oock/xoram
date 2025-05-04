import { getActiveApp } from './application/active-app';
import type { Application, ApplicationHooks } from './application/application.type';
import type { DefinedPlugin, PluginHooks } from './plugins';
import { getActivePlugin } from './plugins/active-plugin';
import { warn } from './warn.helper';


// todo check if all error context are listed here and if they can all occur
export type ErrorContext = keyof PluginHooks | keyof ApplicationHooks | 'onEvent' | 'unknown';

/**
 *
 * @param error the error to handle
 * @param plugin the plugin the error happened in, if it is known
 * @param app the application instance the error happened in, if it is known
 * @param context the context the error happened in
 */
export function handleError(
	error: string | Error,
	plugin: DefinedPlugin | undefined = getActivePlugin(),
	app: Application | undefined = getActiveApp(),
	context: ErrorContext = 'unknown',
): void {
	if (import.meta.env.DEV) {
		warn(error, {plugin, app, context});
	}
	else {
		console.error(error, plugin, app, context);
	}
	app?.options.onError?.(error);
}

export type SafeFunction<fn extends ((...args: unknown[]) => void)> = fn & { _safe: fn };
export type MaybeSafeFunction<fn extends ((...args: unknown[]) => void)> = fn & { _safe?: fn }


export const makeSafe = <fn extends ((...args: unknown[]) => void)>(func: MaybeSafeFunction<fn>): SafeFunction<fn> =>
	func
	&& (func._safe ??= (((...args) => {
		try {
			return func(...args);
		}
		catch (error) {
			handleError(error as Error | string);
		}
	}) as fn)) as SafeFunction<fn>;
