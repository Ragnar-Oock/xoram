import {Application, ApplicationHooks} from "../application.ts";
import {DefinedPlugin, PluginHooks} from "../plugin.ts";


export type ErrorContext = keyof PluginHooks | keyof ApplicationHooks | 'onEvent';

function handleError(error, plugin: DefinedPlugin | undefined, app: Application | undefined, context: ErrorContext) {
    console.error(error, plugin, app, context);
}

/**
 * Prevent user provided logic from breaking the framework.
 *
 * Inspired from {@link https://github.com/vuejs/core/blob/f6e84af30aeffd281aebbab02b0e623e5fc159e0/packages/runtime-core/src/errorHandling.ts#L70 Vue's implementation}
 * @param fun the function to call safely
 * @param plugin the instance of plugin the call is made from
 * @param app the application the plugin instance belongs to
 * @param context the execution context
 * @param args the arguments to pass to the function
 */
export function makeSafeCallable<args extends any[], ret>(
    fun: (...args: args) => ret,
    context: ErrorContext
): (
    plugin: DefinedPlugin | undefined,
    app: Application | undefined,
    ...args: args
) => ret | undefined {
    return (plugin, app, ...args = [] as unknown as args) => {
        try {
            return fun(...args);
        } catch (error) {
            handleError(error, plugin, app, context)
        }
    }
}