import { warn } from '@xoram/utils/warn';
import { getActiveApp } from './application/active-app';
import type { Application, ApplicationHooks } from './application/application.type';
import type { _PluginHooks, DefinedPlugin } from './plugins';
import { getActivePlugin } from './plugins/active-plugin';
import type { _AsyncPluginError } from './plugins/define-async-plugin';


/**
 * @todo check if all error context are listed here and if they can all occur
 * @public
 */
export type ErrorContext =
	| keyof _PluginHooks
	| keyof ApplicationHooks
	| keyof _AsyncPluginError
	| 'onEvent'
	| 'unknown';

/**
 * Invoke the error handling logic :
 * - log the error
 * - call the configured {@link ApplicationOptions.onError | error handler}
 *
 * @param error - the error to handle
 * @param plugin - the plugin the error happened in, if it is known
 * @param app the - application instance the error happened in, if it is known
 * @param context - the context the error happened in
 *
 * @public
 */
export function handleError(
	error: string | Error,
	plugin: DefinedPlugin | undefined = getActivePlugin(),
	app: Application | undefined = getActiveApp(),
	context: ErrorContext = 'unknown',
): void {
	if (import.meta.env.DEV) {
		warn(error, { plugin, app, context });
	}
	else {
		console.error(error, plugin, app, context);
	}
	app?.options.onError?.(error, plugin, app, context);
}

/**
 * @internal
 */
export type SafeFunction<fn extends ((...args: unknown[]) => void)> = fn & { _safe: fn };
/**
 * @internal
 */
export type MaybeSafeFunction<fn extends ((...args: unknown[]) => void)> = fn & { _safe?: fn }


/**
 * @internal
 * @param func
 */
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
