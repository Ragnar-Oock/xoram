import type { Emitter } from 'mitt';
import type { Application, ServiceCollection } from '../application';

export interface ServiceNotifications {
	'before_destroy': {
		/**
		 * The service that emitted the event
		 */
		service: Service
	};

	[x: string | symbol]: unknown;
}

export interface Service<notifications extends Record<string, unknown> = Record<string, unknown>> {
	emitter: Emitter<notifications & ServiceNotifications>;
}

export type ApplicationServiceHooks = {
	/**
	 * Fired before a service is added to the application
	 *
	 * @todo make it preventable ?
	 */
	beforeServiceAdded: {
		app: Application,
		service: Service,
		serviceId: ServiceId,
	};
	/**
	 * Fired when a service has been added to the application
	 */
	serviceAdded: {
		app: Application,
		service: Service,
		serviceId: ServiceId,
	};
	/**
	 * Fired before a service is removed from the application, can be used to do some cleanup.
	 */
	beforeServiceRemoved: {
		app: Application,
		serviceId: ServiceId,
		service: Service,
	};
	/**
	 * Fired after the service has been removed from the application
	 */
	serviceRemoved: {
		app: Application,
		serviceId: ServiceId,
	};
}

export type ServiceId = keyof ServiceCollection & (symbol | string);