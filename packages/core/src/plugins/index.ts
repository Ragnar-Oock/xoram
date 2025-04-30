export { addPlugins, addPlugin } from "./add-plugin";

export {
	definePlugin
} from "./define-plugin";
export type {
	PluginSetup,
	PluginDefinition
} from "./define-plugin";

export {
	onBeforeCreate,
	onCreated,
	onBeforeDestroy
} from "./define-plugin-hooks";

export { dependsOn } from './depends-on.composable';

export { onEvent } from './on-event.composable';

export type { PluginSortingResult } from "./sort";

export type { ApplicationPluginHooks, PluginHooks, PluginHook } from './plugin-hooks.type';

export type { DefinedPlugin, PluginId, PluginPhase } from './plugin.type';

export { removePlugin } from './remove-plugin';

