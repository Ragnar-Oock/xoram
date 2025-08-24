import { warn } from '@xoram/utils/warn';
import type { Application, ServiceCollection } from '../application';
import { getActivePlugin } from '../plugins/active-plugin';
import { beforeCreate, destroyed } from '../plugins/plugin-hooks.type';
import type { Service, ServiceId } from './services.type';

/**
 * Build and return a service object, the provided app can be used to access already registered services or to listen
 * to {@link ApplicationHooks}.
 * @public
 */
export type ServiceFactory<service extends Service> = (application: Application) => service;

/**
 * Register a service the depends on another or on the application.
 *
 * @param id - the id to register the service under, <b>MUST</b> be unique
 * @param serviceFactory - a function taking in the application instance and returning a ready to use service
 *
 * @public
 */
export function addService<id extends ServiceId>(id: id, serviceFactory: ServiceFactory<ServiceCollection[id]>): void;
/**
 * Register a self-contained service with no dependency.
 *
 * @param id - the id to register the service under, <b>MUST</b> be unique
 * @param service -  a ready to use service instance
 *
 * @public
 */
export function addService<id extends ServiceId>(id: id, service: ServiceCollection[id]): void;
/**
 * Use one of the overrides
 *
 * @param serviceId - the id to reference the service
 * @param serviceOrFactory - a service object or a function returning a service object
 *
 * @internal
 */
export function addService<id extends ServiceId>(
	serviceId: id,
	serviceOrFactory: ServiceCollection[id] | ServiceFactory<ServiceCollection[id]>,
): void {
	const plugin = getActivePlugin();

	if (!plugin || plugin.phase !== 'setup') {
		if (import.meta.env.DEV) {
			warn(new Error('addService can\'t be invoked outside of a plugin setup function.'));
		}
		return;
	}

	let service: Service | undefined;

	plugin.hooks.on(beforeCreate, app => {
		if (import.meta.env.DEV && app.services[serviceId]) {
			warn(new Error(
				`A service with id "${ String(serviceId) }" is already registered in the application,`
				+ ` consider using an other string id or a symbol. Skipping.`,
			));
			return;
		}

		service = typeof serviceOrFactory === 'function' ? serviceOrFactory(app) : serviceOrFactory;

		// todo move this to app ?
		app.emitter.emit('beforeServiceAdded', { app, service, serviceId });
		// @ts-expect-error service collection overloads are readonly for some reason
		app.services[serviceId] = service;
		app.emitter.emit('serviceAdded', { app, service, serviceId });
	});

	plugin.hooks.on(destroyed, app => {
		if (!service) {
			// if service is undefined an error occurred during the creation process so the service wasn't added
			// We should abort.
			return;
		}

		// todo emit remove service events
		// todo move this to app ?
		app.emitter.emit('beforeServiceRemoved', { app, service, serviceId });
		service.emitter.emit('before_destroy', { service });

		delete app.services[serviceId];
		app.emitter.emit('serviceRemoved', { app, serviceId });

	});
}