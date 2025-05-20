import type { Emitter } from 'mitt';
import type { Application } from '../application';
import { emitter as createEmitter } from '../emitter';
import type { Service, ServiceNotifications } from './services.type';

/**
 * Define a stateless service, also known as `Topic`.
 *
 * @public
 */
export function defineService<notification extends Record<string, unknown> = Record<string, unknown>>(): () => Service<notification>;
/**
 * Define a stateful service.
 * @param setup - a service setup function, the object returned by this function will be used as the base for the
 *   derived service instances
 *
 * @public
 */
export function defineService<
	notification extends Record<string, unknown> = Record<string, unknown>,
	service extends Record<string, unknown> = Record<string, unknown>
>(
	setup: (app: Application, emitter: Emitter<notification & ServiceNotifications>) => service,
): (app: Application) => Service<notification> & service;
/**
 * Use one of the overloads.
 *
 * @param setup - a service function or nothing
 *
 * @internal
 */
export function defineService<
	notification extends Record<string, unknown> = Record<string, unknown>,
	service extends Record<string, unknown> = Record<string, unknown>
>(
	setup?: (app: Application, emitter: Emitter<notification & ServiceNotifications>) => service,
): (app: Application) => Service<notification> & service {
	return (app): Service<notification> & service => {
		const emitter = createEmitter<notification & ServiceNotifications>();
		return {
			...(setup ? setup(app, emitter) : {} as service),
			emitter,
		};
	};
}
