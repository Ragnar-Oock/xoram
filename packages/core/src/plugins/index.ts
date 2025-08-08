export { addPlugins, addPlugin } from './add-plugin';

export type { OneOrMore } from './array.helper';

export type { _AsyncPluginError } from './define-async-plugin';
export { defineAsyncPlugin } from './define-async-plugin';

export {
	definePlugin,
} from './define-plugin';
export type {
	PluginSetup,
	PluginDefinition,
} from './define-plugin';

export {
	onBeforeCreate,
	onCreated,
	onBeforeDestroy,
} from './define-plugin-hooks';

export { dependsOn } from './depends-on.composable';

export type {
	Notifications,
	EventSourceContainer,
	EventSourceGetter,
	MergedEvents,
	EventCleanup,
	EventTarget,
	EventSource,
	UnionToIntersection,
} from './on-event.composable';
export { onEvent } from './on-event.composable';

export type { ApplicationPluginHooks, _PluginHooks } from './plugin-hooks.type';

export type { DefinedPlugin, PluginId, _PluginPhase } from './plugin.type';

export { removePlugin } from './remove-plugin';
