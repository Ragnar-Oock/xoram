import type { Application, ApplicationHooks } from './application/application.type';
import type { DefinedPlugin, PluginHooks } from './plugins';


export type ErrorContext = keyof PluginHooks | keyof ApplicationHooks | 'onEvent' | 'unknown';

export function handleError(
	error: unknown,
	plugin?: DefinedPlugin | undefined,
	app?: Application | undefined,
	context: ErrorContext = 'unknown'): void {
	console.error(error, plugin, app, context);
}
