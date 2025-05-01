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
	let spy: Mock;
	let serviceFactory: () => Service<Notifications>;

	beforeEach(() => {
		emitter = mitt();
		spy = vi.fn();
		serviceFactory = defineService<Notifications>()
	});

	describe('valid calls', () => {
		// --- Direct emitter ---
		it('should handle wildcard event listener with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, '*', spy);
			})]);

			checkWildcardEvent(emitter, spy);
		});

		it('should handle single event listener with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, 'eventA', spy);
			})]);

			checkSingleEvent(emitter, spy);
		});

		it('should handle multiple event listeners with direct emitter', () => {
			createApp([definePlugin(() => {
				onEvent(emitter, ['eventA', 'eventB'], spy);
			})]);

			checkMultiEvent(emitter, spy);
		});

		// --- { emitter } object ---
		it('should handle wildcard event listener with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, '*', spy);
			})]);

			checkWildcardEvent(emitter, spy);
		});

		it('should handle single event listener with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, 'eventA', spy);
			})]);

			checkSingleEvent(emitter, spy);
		});

		it('should handle multiple event listeners with emitter wrapped in object', () => {
			createApp([definePlugin(() => {
				onEvent({ emitter }, ['eventA', 'eventB'], spy);
			})]);

			checkMultiEvent(emitter, spy);
		});

		// --- Getter: app => app.services.service.emitter ---
		it('should handle wildcard event listener with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service.emitter, '*', spy);
			})]);
			checkWildcardEvent(app.services.service.emitter, spy);
		});

		it('should handle single event listener with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service.emitter, 'eventA', spy);
			})]);

			checkSingleEvent(app.services.service.emitter, spy);
		});

		it('should handle multiple event listeners with direct emitter getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);

				onEvent(app => app.services.service.emitter, ['eventA', 'eventB'], spy);
			})]);

			checkMultiEvent(app.services.service.emitter, spy);
		});

		// --- Getter: app => app.services.service (returns object with emitter) ---
		it('should handle wildcard event listener with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, '*', spy);
			})]);

			checkWildcardEvent(app.services.service.emitter, spy);
		});

		it('should handle single event listener with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, 'eventA', spy);
			})]);

			checkSingleEvent(app.services.service.emitter, spy);
		});

		it('should handle multiple event listeners with service object getter', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent(app => app.services.service, ['eventA', 'eventB'], spy);
			})]);

			checkMultiEvent(app.services.service.emitter, spy);
		});

		// --- Service ID string ---
		it('should handle wildcard event listener with service ID string', () => {
			onEvent('service', '*', spy);
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', '*', spy);
			})]);

			checkWildcardEvent(app.services.service.emitter, spy);
		});

		it('should handle single event listener with service ID string', () => {
			onEvent('service', 'eventA', spy);
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', 'eventA', spy);
			})]);

			checkSingleEvent(app.services.service.emitter, spy);
		});

		it('should handle multiple event listeners with service ID string', () => {
			const app = createApp([definePlugin(() => {
				addService('service', serviceFactory);
				onEvent('service', ['eventA', 'eventB'], spy);
			})]);

			checkMultiEvent(app.services.service.emitter, spy);
		});
	});
	describe('handler invocation', () => {
		it('should not modify the this of the handler', () => {
			const bob = {
				handler() {
					spy(this);
				}
			}

			createApp([definePlugin(() => {
				onEvent(emitter, 'eventA', bob.handler.bind(bob));
			})]);

			emitter.emit('eventA', eventA);

			expect(spy).toHaveBeenCalledWith(bob);
		});
	});
})

/**
onEvent(emitter, '*', spy);
onEvent(emitter, 'eventA', spy);
onEvent(emitter, ['eventA', 'eventB'], spy);

onEvent({emitter}, '*', spy);
onEvent({emitter}, 'eventA', spy);
onEvent({emitter}, ['eventA', 'eventB'], spy);

onEvent(app => app.services.service.emitter, '*', spy);
onEvent(app => app.services.service.emitter, 'eventA', spy);
onEvent(app => app.services.service.emitter, ['eventA', 'eventB'], spy);

onEvent(app => app.services.service, '*', spy);
onEvent(app => app.services.service, 'eventA', spy);
onEvent(app => app.services.service, ['eventA', 'eventB'], spy);

onEvent('service', '*', spy);
onEvent('service', 'eventA', spy);
onEvent('service', ['eventA', 'eventB'], spy);
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
