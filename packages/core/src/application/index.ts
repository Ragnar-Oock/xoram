export { createApp, destroyApp } from "./create-app";

export type {
	Application,
	ApplicationConfig,
	ServiceCollection,
	ApplicationHooks,
	ApplicationPluginEvent
} from "./application.type";
export  { serviceSymbol, pluginSymbol } from "./application.type";

export { getActiveApp, setActiveApp } from "./active-app";

export { onFailedPluginRegistration } from "./define-application-hooks";

