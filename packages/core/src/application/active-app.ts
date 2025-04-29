import type { Application } from './application.type';

let activeApp: Application | undefined;

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
export const setActiveApp = (app: Application): () => void => {
	const previous = activeApp;
	activeApp = app;
	return () => activeApp = previous;
};

/**
 * Access the current application context
 *
 * @internal
 */
export const getActiveApp = (): Application | undefined => activeApp;