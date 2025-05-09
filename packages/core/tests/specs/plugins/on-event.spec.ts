import mitt, { type Emitter } from 'mitt';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { Application, Service } from '../../../src';
import { addService, createApp, definePlugin, defineService, onEvent } from '../../../src';
import { noop } from '../../dummies/noop';

const eventA = Object.freeze({ a: 1, b: '2' });
const eventB = Object.freeze({ a: 3, c: '4' });

type Notifications = {
	eventA: { a: 1, b: '2' };
	eventB: { a: 3, c: '4' };
};

declare module '../../../src' {
	interface ServiceCollection {
		service: Service<Notifications>;
	}
}

function checkSingleEvent<notifications extends Notifications>(emitter: Emitter<notifications>, spy: Mock): void {
	emitter.emit('eventA', eventA);

	expect(spy).toHaveBeenCalledExactlyOnceWith(eventA);
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
		serviceFactory = defineService<Notifications>();
	});

	describe('valid event registrations', () => {
		// --- Direct emitter ---
		it('should handle wildcard event listener with direct emitter', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, '*', handler);
				}),
			]);

			checkWildcardEvent(emitter, handler);
		});

		it('should handle single event listener with direct emitter', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', handler);
				}),
			]);

			checkSingleEvent(emitter, handler);
		});

		it('should handle multiple event listeners with direct emitter', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(emitter, handler);
		});

		// --- { emitter } object ---
		it('should handle wildcard event listener with emitter wrapped in object', () => {
			createApp([
				definePlugin(() => {
					onEvent({ emitter }, '*', handler);
				}),
			]);

			checkWildcardEvent(emitter, handler);
		});

		it('should handle single event listener with emitter wrapped in object', () => {
			createApp([
				definePlugin(() => {
					onEvent({ emitter }, 'eventA', handler);
				}),
			]);

			checkSingleEvent(emitter, handler);
		});

		it('should handle multiple event listeners with emitter wrapped in object', () => {
			createApp([
				definePlugin(() => {
					onEvent({ emitter }, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(emitter, handler);
		});

		// --- Getter: app => app.services.service.emitter ---
		it('should handle wildcard event listener with direct emitter getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent(app => app.services.service.emitter, '*', handler);
				}),
			]);
			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with direct emitter getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent(app => app.services.service.emitter, 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with direct emitter getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);

					onEvent(app => app.services.service.emitter, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.service.emitter, handler);
		});

		// --- Getter: app => app.services.service (returns object with emitter) ---
		it('should handle wildcard event listener with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent(app => app.services.service, '*', handler);
				}),
			]);

			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent(app => app.services.service, 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent(app => app.services.service, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.service.emitter, handler);
		});

		// --- Service ID string ---
		it('should handle wildcard event listener with service ID string', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent('service', '*', handler);
				}),
			]);

			checkWildcardEvent(app.services.service.emitter, handler);
		});

		it('should handle single event listener with service ID string', () => {
			onEvent('service', 'eventA', handler);
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent('service', 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.service.emitter, handler);
		});

		it('should handle multiple event listeners with service ID string', () => {
			const app = createApp([
				definePlugin(() => {
					addService('service', serviceFactory);
					onEvent('service', [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.service.emitter, handler);
		});
	});

	describe('correct target resolution', () => {
		it.todo('should use the target directly when given a direct emitter', () => {
		});
		it.todo('should use the emitter prop when given an emitter carrying object', () => {
		});
		it.todo(
			'should use the emitter returned by invoking the function with the app instance when given a getter function',
			() => {
			},
		);
		it.todo('should use the emitter of the service resolved on the app instance when given an id', () => {
		});
	});

	describe('handler invocation', () => {
		it('should preserve the original this binding', () => {
			const bob = {
				handler() {
					handler(this);
				},
			};

			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', bob.handler.bind(bob));
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledWith(bob);
		});
		it.todo('should invoke the handler that was passed in', () => {
		});
		it.todo('should invoke the handler only when one of the specified events is emitted by the target', () => {
		});
		it.todo('should invoke the handler every time the event is emitted', () => {
		});
		it.todo('should invoke the handler with the event payload (single and multi overloads)', () => {
		});
		it.todo('should invoke the handler with the event name and payload (wildcard overload)', () => {
		});
		it.todo('should be scoped to the target emitter', () => {
		});
		it.todo('should not be invoked after cleanup', () => {
		});
	});

	const getServiceEmitter = (app: Application) => app.services.service.emitter as unknown as Emitter<Notifications>;

	describe('cleanup', () => {
		describe.for<[
			name: string,
			callback: () => [ cleanup: () => void, emitter: (app: Application) => Emitter<Notifications> ]
		]>([
			[ 'overload 1:1 onEvent(emitter, \'*\', handler)', () => [ onEvent(emitter, '*', handler), () => emitter ] ],
			[
				'overload 1:2 onEvent(emitter, \'eventA\', handler)',
				() => [ onEvent(emitter, 'eventA', handler), () => emitter ],
			],
			[
				'overload 1:3 onEvent(emitter, [\'eventA\', \'eventB\'], handler)',
				() => [ onEvent(emitter, [ 'eventA', 'eventB' ], handler), () => emitter ],
			],
			[ 'overload 2:1 onEvent({emitter}, \'*\', handler)', () => [ onEvent({ emitter }, '*', handler), () => emitter ] ],
			[
				'overload 2:2 onEvent({emitter}, \'eventA\', handler)',
				() => [ onEvent({ emitter }, 'eventA', handler), () => emitter ],
			],
			[
				'overload 2:3 onEvent({emitter}, [\'eventA\', \'eventB\'], handler)',
				() => [ onEvent({ emitter }, [ 'eventA', 'eventB' ], handler), () => emitter ],
			],
			[
				'overload 3:1 onEvent(app => app.services.service.emitter, \'*\', handler)',
				() => [ onEvent(app => app.services.service.emitter, '*', handler), getServiceEmitter ],
			],
			[
				'overload 3:2 onEvent(app => app.services.service.emitter, \'eventA\', handler)',
				() => [ onEvent(app => app.services.service.emitter, 'eventA', handler), getServiceEmitter ],
			],
			[
				'overload 3:3 onEvent(app => app.services.service.emitter, [\'eventA\', \'eventB\'], handler)',
				() => [ onEvent(app => app.services.service.emitter, [ 'eventA', 'eventB' ], handler), getServiceEmitter ],
			],
			[
				'overload 4:1 onEvent(app => app.services.service, \'*\', handler)',
				() => [ onEvent(app => app.services.service, '*', handler), getServiceEmitter ],
			],
			[
				'overload 4:2 onEvent(app => app.services.service, \'eventA\', handler)',
				() => [ onEvent(app => app.services.service, 'eventA', handler), getServiceEmitter ],
			],
			[
				'overload 4:3 onEvent(app => app.services.service, [\'eventA\', \'eventB\'], handler)',
				() => [ onEvent(app => app.services.service, [ 'eventA', 'eventB' ], handler), getServiceEmitter ],
			],
			[
				'overload 5:1 onEvent(\'service\', \'*\', handler)',
				() => [ onEvent('service', '*', handler), getServiceEmitter ],
			],
			[
				'overload 5:2 onEvent(\'service\', \'eventA\', handler)',
				() => [ onEvent('service', 'eventA', handler), getServiceEmitter ],
			],
			[
				'overload 5:3 onEvent(\'service\', [\'eventA\', \'eventB\'], handler)',
				() => [ onEvent('service', [ 'eventA', 'eventB' ], handler), getServiceEmitter ],
			],
		])('%s', ([ _, callback ]) => {
			let cleanup: () => void = noop,
				emitter: (app: Application) => Emitter<Notifications>;
			it('should return a nullary void function', () => {
				createApp([
					definePlugin(() => {
						addService('service', serviceFactory);

						[ cleanup ] = callback();
					}),
				]);

				expect(cleanup).not.toBe(noop);
				expect(cleanup()).toBeUndefined();
			});
			it('should stop handler from being called after cleanup', () => {
				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);

						[ cleanup, emitter ] = callback();
					}),
				]);

				emitter(app).emit('eventA', eventA);
				cleanup();
				emitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledOnce();
			});
			it('should not affect other listeners', () => {
				let otherSpy = vi.fn();

				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);

						[ cleanup, emitter ] = callback();
						onEvent(emitter, '*', otherSpy);
					}),
				]);

				emitter(app).emit('eventA', eventA);
				cleanup();
				emitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledOnce();
				expect(otherSpy).toHaveBeenCalledTimes(2);
			});
			it('should be idempotent', () => {
				createApp([
					definePlugin(() => {
						addService('service', serviceFactory);

						[ cleanup ] = callback();
					}),
				]);

				cleanup();

				expect(() => cleanup()).not.toThrow();
			});
		});
	});
});

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
