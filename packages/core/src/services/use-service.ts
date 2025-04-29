import type { ServiceCollection } from '../application';
import { getActiveApp } from '../application/active-app';


export function useService<id extends keyof ServiceCollection>(serviceId: id): ServiceCollection[id] {
	const app = getActiveApp();

if (app === undefined) {
		throw new Error('useService used without an active zoram application'); // todo do better
	}

	return app.services[serviceId];
}
