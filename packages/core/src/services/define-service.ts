import type { Emitter } from 'mitt';
import type { Application } from '../application';
import { emitter as createEmitter } from '../emitter';
import type { Service, ServiceNotifications } from './services.type';

/**
 * @public
 */
export type NotificationsFromService<service> = service extends Service<infer notification> ? notification : never;

/**
 * Define a stateless service, also known as `Topic`.
 *
 * {@label TOPIC}
 *
 * @public
 */
export function defineService<notification extends Record<string, unknown> = Record<string, never>>(): () => Service<notification>;
/**
 * Define a stateful service.
 * @param setup - a service setup function, the object returned by this function will be used as the base for the
 *   derived service instances
 *
 * {@label STATEFUL_INFERRED}
 *
 * @public
 */
export function defineService<
	notification extends Record<string, unknown> = Record<string, never>,
	service = object
>(
	setup: (app: Application, emitter: Emitter<notification & ServiceNotifications>) => Omit<service, keyof Service>,
): (app: Application) => Service<notification> & service;
/**
 * Use one of the overloads.
 *
 * @param setup - a service function or nothing
 *
 * @internal
 */
export function defineService<
	notification extends Record<string, unknown> = Record<string, never>,
	service extends object = object
>(
	setup?: (app: Application, emitter: Emitter<notification & ServiceNotifications>) => service,
): (app: Application) => Service<notification> & service {
	return (app): Service<notification> & service => {
		const emitter = createEmitter<notification & ServiceNotifications>();

		return Object.defineProperty(
			(setup?.(app, emitter) ?? {} as service),
			'emitter',
			{
				value: emitter,
				enumerable: true,
			},
		) as Service<notification> & service;
	};
}
