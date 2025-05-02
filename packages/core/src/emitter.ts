import type { Emitter, EventType } from 'mitt';
import mitt from 'mitt';
import { makeSafe } from './error-handling';

export function emitter<Events extends Record<EventType, unknown>>(): Emitter<Events> {
	let instance
	return {
		...(instance = mitt<Events>()),
		on: ((type: string | symbol, handler: (...args: unknown[]) => void): void => instance.on(type, makeSafe(handler))) as Emitter<Events>['on'],
		off: ((type: string | symbol, handler: (...args: unknown[]) => void): void => instance.off(type, makeSafe(handler)))  as Emitter<Events>['off']
	}
}