import type { Application } from '../application';
import { emitter } from '../emitter';
import type { Service, ServiceNotifications } from './services.type';

export function defineService<notification extends Record<string, unknown> = Record<string, never>, service extends Record<string, unknown> = Record<string, unknown>>(setup: (app: Application) => service): (app: Application) => Service<notification & ServiceNotifications> & service {
	return (app): Service<notification & ServiceNotifications> & service => {
		return {
			...setup(app),
			emitter: emitter<notification & ServiceNotifications>(),
		}
	}
}
