import {Application} from "./application.type";

export let activeApp: Application | undefined;

/**
 * Set the current application context.
 *
 * Used to scope hooks to the app they are used in.
 *
 * @param app the application to set as active
 *
 * @internal
 */
export function setActiveApp(app?: Application): Application | undefined {
	return (activeApp = app);
}

/**
 * Access the current application context
 *
 * @internal
 */
export function getActiveApp(): Application | undefined {
	return activeApp;
}