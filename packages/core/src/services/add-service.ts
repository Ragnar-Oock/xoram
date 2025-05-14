import type { Application, ServiceCollection } from '../application';
import { getActivePlugin } from '../plugins/active-plugin';
import { beforeCreate, beforeDestroy } from '../plugins/plugin-hooks.type';
import { warn } from '../warn.helper';
import type { Service, ServiceId } from './services.type';

/**
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

	plugin.hooks.on(beforeCreate, app => {
		const service = typeof serviceOrFactory === 'function' ? serviceOrFactory(app) : serviceOrFactory;

		// todo move this to app ?
		app.emitter.emit('beforeServiceAdded', { app, service, serviceId });
		// @ts-expect-error service collection overloads are readonly for some reason
		app.services[serviceId] = service;
		app.emitter.emit('serviceAdded', { app, service, serviceId });
	});

	plugin.hooks.on(beforeDestroy, app => {
		// todo emit remove service events
		// todo move this to app ?

		delete app.services[serviceId];
	});
}