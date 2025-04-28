import mitt from 'mitt';
import type { Application } from '../application';
import type { Service, ServiceNotifications } from './services.type';

export function defineService<notification extends Record<string, unknown> = Record<string, never>, service extends Record<string, unknown> = Record<string, unknown>>(setup: (app: Application) => service): (app: Application) => Service<notification & ServiceNotifications> & service {
	return (app): Service<notification & ServiceNotifications> & service => {
		return {
			...setup(app),
			emitter: mitt<notification & ServiceNotifications>(),
		}
	}
}
