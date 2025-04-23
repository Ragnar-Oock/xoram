export { dependsOn } from './depends-on.composable';
export { onBeforeCreate, onCreated, onBeforeDestroy } from "./define-plugin-hooks";
export { onEvent } from './on-event.composable';
export {
    definePlugin, getActivePlugin
} from './define-plugin';
export type {
    PluginId,
    DefinedPlugin, PluginHook,
    PluginHooks,
    PluginSetup
} from './define-plugin';
