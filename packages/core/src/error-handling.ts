import type { Application, ApplicationHooks } from './application/application.type';
import type { DefinedPlugin, PluginHooks } from './plugins';


export type ErrorContext = keyof PluginHooks | keyof ApplicationHooks | 'onEvent';

function handleError(error: unknown, plugin: DefinedPlugin | undefined, app: Application | undefined, context: ErrorContext): void {
	console.error(error, plugin, app, context);
}

/**
 * Prevent user provided logic from breaking the framework.
 *
 * Inspired from
 * {@link https://github.com/vuejs/core/blob/f6e84af30aeffd281aebbab02b0e623e5fc159e0/packages/runtime-core/src/errorHandling.ts#L70 Vue's implementation}
 * @param fun the function to call safely
 * @param plugin the instance of plugin the call is made from
 * @param app the application the plugin instance belongs to
 * @param context the execution context
 */
export function makeSafeCallable<args extends unknown[], ret>(
	fun: (...args: args) => ret,
	context: ErrorContext,
	plugin: DefinedPlugin | undefined,
	app: Application | undefined,
): (
	...args: args
) => ret | undefined {
	return (...args): ret | undefined => {
		try {
			return fun(...args);
		} catch (error) {
			handleError(error, plugin, app, context)
		}
	}
}

export function invokeHookWithErrorHandling<args extends unknown[]>(
	hook: (...args: args) => void,
	context: ErrorContext,
	plugin: DefinedPlugin | undefined,
	app: Application | undefined,
	...args: args
): void {
	try {
		hook(...args);
	}
	catch (error) {
		handleError(error, plugin, app, context);
	}
}
