import { Application } from './application.type';

export let activeApp: Application | undefined;

/**
 * Set the current application context.
 *
 * Used to scope hooks to the app they are used in.
 *
 * @param app the application to set as active
 *
 * @returns a function to reset the `activeApp` to it's value from before the call
 *
 * @internal
 */
export function setActiveApp(app: Application): () => void {
	const previous = activeApp;
	activeApp = app;
	return (): void => {
		activeApp = previous
	};
}

/**
 * Access the current application context
 *
 * @internal
 */
export function getActiveApp(): Application | undefined {
	return activeApp;
}