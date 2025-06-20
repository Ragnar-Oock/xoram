import type { ServiceCollection } from '../application';
import { getActiveApp } from '../application/active-app';


/**
 * @param serviceId - the id of the service to access
 *
 * @beta
 */
export function useService<id extends keyof ServiceCollection>(serviceId: id): ServiceCollection[id] {
	const app = getActiveApp();

	if (!app) {
		throw new Error('useService used without an active xoram application'); // todo do better
	}

	return app.services[serviceId];
}
