import type { Emitter } from 'mitt';
import type { Application } from '../application';
import { emitter as createEmitter } from '../emitter';
import type { Service, ServiceNotifications } from './services.type';

export function defineService<notification extends Record<string, unknown> = Record<string, never>>(): () => Service<notification>;
export function defineService<
	notification extends Record<string, unknown> = Record<string, never>,
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
