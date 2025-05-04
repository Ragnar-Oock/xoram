import mitt, { type Emitter } from 'mitt';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { Service } from '../../../src'
import { addService, createApp, definePlugin, defineService, onEvent } from '../../../src';

const eventA = Object.freeze({a: 1, b: '2'});
const eventB = Object.freeze({a: 3, c: '4'});

type Notifications = {
	eventA: {a: 1, b: '2'};
	eventB: {a: 3, c: '4'};
};

declare module '../../../src' {
	interface ServiceCollection {
		service: Service<Notifications>;
	}
}

function checkSingleEvent<notifications extends Notifications>(emitter: Emitter<notifications>, spy: Mock): void {
	emitter.emit('eventA', eventA);

	expect(spy).toHaveBeenCalledOnce();
	expect(spy).toHaveBeenCalledWith(eventA);
}

function checkMultiEvent<notifications extends Notifications>(emitter: Emitter<notifications>, spy: Mock): void {
	emitter.emit('eventA', eventA);
	emitter.emit('eventB', eventB);

	expect(spy).toHaveBeenCalledTimes(2);
	expect(spy).toHaveBeenCalledWith(eventA);
	expect(spy).toHaveBeenCalledWith(eventB);
}

function checkWildcardEvent<notifications extends Notifications>(emitter: Emitter<notifications>, spy: Mock): void {
	emitter.emit('eventA', eventA);
	emitter.emit('eventB', eventB);

	expect(spy).toHaveBeenCalledTimes(2);
	expect(spy).toHaveBeenCalledWith('eventA', eventA);
	expect(spy).toHaveBeenCalledWith('eventB', eventB);
}


describe('onEvent', () => {
	let emitter: Emitter<Notifications>;
	let handler: Mock;
	let serviceFactory: () => Service<Notifications>;

	beforeEach(() => {
		emitter = mitt();
		handler = vi.fn();
		serviceFactory = defineService<Notifications>()
	});

	describe('valid event registrations', () => {
		// --- Direct emitter ---
		it('should handle wildcard event listener with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, '*', handler);
			})]);

			checkWildcardEvent(emitter, handler);
		});

		it('should handle single event listener with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, 'eventA', handler);
			})]);

			checkSingleEvent(emitter, handler);
		});

		it('should handle multiple event listeners with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, ['eventA', 'eventB'], handler);
			})]);

			checkMultiEvent(emitter, handler);
		});

		// --- { emitter } object ---
		it('should handle wildcard event listener with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, '*', handler);
			})]);

			checkWildcardEvent(emitter, handler);
		});

		it('should handle single event listener with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, 'eventA', handler);
			})]);

			checkSingleEvent(emitter, handler);
		});

		it('should handle multiple event listeners with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, ['eventA', 'eventB'], handler);
			})]);

			checkMultiEvent(emitter, handler);
		});

		// --- Getter: app => app.services.service.emitter ---
		it('should handle wildcard event listener with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service.emitter, '*', handler);
			})]);
			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service.emitter, 'eventA', handler);
			})]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);

				onEvent(app => app.services.service.emitter, ['eventA', 'eventB'], handler);
			})]);

			checkMultiEvent(app.services.service.emitter, handler);
		});

		// --- Getter: app => app.services.service (returns object with emitter) ---
		it('should handle wildcard event listener with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, '*', handler);
			})]);

			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, 'eventA', handler);
			})]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, ['eventA', 'eventB'], handler);
			})]);

			checkMultiEvent(app.services.service.emitter, handler);
		});

		// --- Service ID string ---
		it('should handle wildcard event listener with service ID string', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', '*', handler);
			})]);

			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with service ID string', () => {
			onEvent('service', 'eventA', handler);
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', 'eventA', handler);
			})]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with service ID string', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', ['eventA', 'eventB'], handler);
			})]);

			checkMultiEvent(app.services.service.emitter, handler);
		});
	});
	describe('handler invocation', () => {
		it('should not modify the this of the handler', () => {
			const bob = {
				handler() {
					handler(this);
				}
			}

			createApp([definePlugin(() => {
				onEvent(emitter, 'eventA', bob.handler.bind(bob));
			})]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledWith(bob);
		});
	});
})

/**
onEvent(emitter, '*', handler);
onEvent(emitter, 'eventA', handler);
onEvent(emitter, ['eventA', 'eventB'], handler);

onEvent({emitter}, '*', handler);
onEvent({emitter}, 'eventA', handler);
onEvent({emitter}, ['eventA', 'eventB'], handler);

onEvent(app => app.services.service.emitter, '*', handler);
onEvent(app => app.services.service.emitter, 'eventA', handler);
onEvent(app => app.services.service.emitter, ['eventA', 'eventB'], handler);

onEvent(app => app.services.service, '*', handler);
onEvent(app => app.services.service, 'eventA', handler);
onEvent(app => app.services.service, ['eventA', 'eventB'], handler);

onEvent('service', '*', handler);
onEvent('service', 'eventA', handler);
onEvent('service', ['eventA', 'eventB'], handler);
 */

/**
 * wildcard event handler :
 * get type parameter
 * get event payload matching the type
 */

/**
 * multi event handler :
 * get event payload with only overlapping members
 */

/**
 * single event handler :
 * get event payload
 */

/** all handlers
 * don't modify the `this` context of the handler when called
 */

/**
 * called in a plugin context ?
 * called in a plugin setup phase ?
 * called in a plugin hook ?
 */

/**
 * cleanup function :
 * is idempotent
 * is automatically invoked on plugin removal
 * does not affect other listeners set on the same event(s) of the same emitter
 */
