import type { Emitter, EventType } from 'mitt';
import mitt from 'mitt';
import { handleError } from './error-handling';

export function emitter<Events extends Record<EventType, unknown>>(): Emitter<Events> {
	const instance = mitt<Events>();
	const on = instance.on;

	instance.on = ((type: string | symbol, handler: (...args: unknown[]) => void): void => {
		on(type, (...args: unknown[]): void => {
			try {
				handler(...args);
			}
			catch (error) {
				handleError(error); // todo figure out what useful info can be passed here
			}
		});
	}) as Emitter<Events>['on']

	return instance;
}