import mitt, { type Emitter } from 'mitt';
import { beforeEach, describe, expect, type Mock, vi } from 'vitest';
import {
	addService,
	type Application,
	createApp,
	definePlugin,
	defineService,
	dependsOn,
	destroyApp,
	onBeforeCreate,
	onBeforeDestroy,
	onCreated,
	onEvent,
	removePlugin,
	type Service,
} from '../../../src';
import { getActivePlugin } from '../../../src/plugins/active-plugin';
import { noop } from '../../dummies/noop';
import { expectPrettyWarn } from '../../fixture/expect.fixture';
import { it } from '../../fixture/test.fixture';


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

type OverloadCase = [
	name: string,
	callback: (onEvent?: () => void) => [ cleanup: () => void, emitter: (app: Application) => Emitter<Notifications> ]
]

const getServiceEmitter = (app: Application) => app.services.service.emitter as unknown as Emitter<Notifications>;

describe('onEvent', () => {
	let emitter: Emitter<Notifications>;
	let handler: Mock;
	let serviceFactory: () => Service<Notifications>;


	const overloadsCases = [
		[
			'overload 1:1 onEvent(emitter, \'*\', handler)', (callback) => [
			onEvent(emitter, '*', (...args) => {
				handler(...args);
				callback?.();
			}), () => emitter,
		],
		],
		[
			'overload 1:2 onEvent(emitter, \'eventA\', handler)',
			(callback) => [
				onEvent(emitter, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 1:3 onEvent(emitter, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent(emitter, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 1:3 (+single event) onEvent(emitter, [\'eventA\'], handler)',
			(callback) => [
				onEvent(emitter, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 2:1 onEvent({emitter}, \'*\', handler)',
			(callback) => [
				onEvent({ emitter }, '*', (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 2:2 onEvent({emitter}, \'eventA\', handler)',
			(callback) => [
				onEvent({ emitter }, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 2:3 onEvent({emitter}, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent({ emitter }, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 2:3 (+single event) onEvent({emitter}, [\'eventA\'], handler)',
			(callback) => [
				onEvent({ emitter }, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), () => emitter,
			],
		],
		[
			'overload 3:1 onEvent(app => app.services.service.emitter, \'*\', handler)',
			(callback) => [
				onEvent(app => app.services.service.emitter, '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:2 onEvent(app => app.services.service.emitter, \'eventA\', handler)',
			(callback) => [
				onEvent(app => app.services.service.emitter, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:3 onEvent(app => app.services.service.emitter, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent(app => app.services.service.emitter, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:3 (+single event) onEvent(app => app.services.service.emitter, [\'eventA\'], handler)',
			(callback) => [
				onEvent(app => app.services.service.emitter, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:1 onEvent(app => app.services.service, \'*\', handler)',
			(callback) => [
				onEvent(app => app.services.service, '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:2 onEvent(app => app.services.service, \'eventA\', handler)',
			(callback) => [
				onEvent(app => app.services.service, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:3 onEvent(app => app.services.service, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent(app => app.services.service, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:3 (+single event) onEvent(app => app.services.service, [\'eventA\'], handler)',
			(callback) => [
				onEvent(app => app.services.service, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:1 onEvent(\'service\', \'*\', handler)',
			(callback) => [
				onEvent('service', '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:2 onEvent(\'service\', \'eventA\', handler)',
			(callback) => [
				onEvent('service', 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:3 onEvent(\'service\', [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent('service', [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:3 (+single event) onEvent(\'service\', [\'eventA\'], handler)',
			(callback) => [
				onEvent('service', [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
	] as const satisfies OverloadCase[];


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
		it('should invoke the handler that was passed in', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', handler);
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledOnce();
		});
		it('should invoke the handler only when one of the specified events is emitted by the target', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', handler);
				}),
			]);

			emitter.emit('eventA', eventA);
			emitter.emit('eventB', eventB);

			expect(handler).toHaveBeenCalledOnce();
		});
		it('should invoke the handler every time the event is emitted', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', handler);
				}),
			]);

			emitter.emit('eventA', eventA);
			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledTimes(2);
		});
		it('should invoke the handler with the event payload (single overloads)', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, 'eventA', handler);
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledWith(eventA);
		});
		it('should invoke the handler with the event payload (multi overloads)', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledExactlyOnceWith(eventA);
		});
		it('should invoke the handler with the event payload (multi overloads with single event)', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, [ 'eventA' ], handler);
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledExactlyOnceWith(eventA);
		});
		it('should invoke the handler with the event name and payload (wildcard overload)', () => {
			createApp([
				definePlugin(() => {
					onEvent(emitter, '*', handler);
				}),
			]);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledExactlyOnceWith('eventA', eventA);
		});
		it('should be scoped to the target emitter', () => {
			const service = defineService<Notifications>()();
			createApp([
				definePlugin(() => {
					onEvent(emitter, '*', handler);
				}),
			]);

			service.emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledTimes(0);
		});
		it('should not be invoked after cleanup', () => {
			destroyApp(
				createApp([
					definePlugin(() => {
						onEvent(emitter, '*', handler);
					}),
				]),
			);

			emitter.emit('eventA', eventA);

			expect(handler).toHaveBeenCalledTimes(0);
		});
	});

	describe('cleanup', () => {
		describe.for<OverloadCase>(overloadsCases)('%s', ([ _, callback ]) => {
			let cleanup: () => void = noop,
				getEmitter: (app: Application) => Emitter<Notifications>;
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

						[ cleanup, getEmitter ] = callback();
					}),
				]);

				getEmitter(app).emit('eventA', eventA);
				cleanup();
				getEmitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledOnce();
			});
			it('should not affect other listeners', () => {
				let otherSpy = vi.fn();

				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);

						[ cleanup, getEmitter ] = callback();
						onEvent(getEmitter, '*', otherSpy);
					}),
				]);

				getEmitter(app).emit('eventA', eventA);
				cleanup();
				getEmitter(app).emit('eventA', eventA);

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

	describe('life cycle', () => {
		describe.for<OverloadCase>(overloadsCases)('%s', ([ _, callback ]) => {

			let getEmitter: (app: Application) => Emitter<Notifications>;

			it('should wait for the `active` phase when invoked during `setup`', ({ warnSpy }) => {
				let pluginPhase: string = 'unset';

				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);
						const plugin = getActivePlugin();

						[ , getEmitter ] = callback(() => pluginPhase = plugin!.phase);
					}),
				]);

				getEmitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledOnce();
				expect(warnSpy).toHaveBeenCalledTimes(0); // no warning logged
				expect(pluginPhase).toBe('active');
			});
			it('should wait for the `active` phase when invoked during `mount`', ({ warnSpy }) => {
				// setup
				let pluginPhase: string = 'unset';

				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);
						const plugin = getActivePlugin();

						onBeforeCreate(() => {
							[ , getEmitter ] = callback(() => pluginPhase = plugin!.phase);
						});
					}),
				]);

				// exec
				getEmitter(app).emit('eventA', eventA);

				// check
				expect(handler).toHaveBeenCalledOnce();
				expect(warnSpy).toHaveBeenCalledTimes(0); // no warning logged
				expect(pluginPhase).toBe('active');
			});
			it('should add the listener immediately when invoked during `active`', ({ warnSpy }) => {
				// setup
				let pluginPhase: string = 'unset';

				const app = createApp([
					definePlugin(() => {
						addService('service', serviceFactory);
						const plugin = getActivePlugin();

						onCreated(() => {
							[ , getEmitter ] = callback(() => pluginPhase = plugin!.phase);
						});
					}),
				]);

				// exec
				getEmitter(app).emit('eventA', eventA);

				// check
				expect(handler).toHaveBeenCalledOnce();
				expect(warnSpy).toHaveBeenCalledTimes(0); // no warning logged
				expect(pluginPhase).toBe('active');
			});
			it('should warn and skip when invoked during `teardown`', ({ warnSpy }) => {
				// setup
				const servicePlugin = definePlugin('service', () => {
					addService('service', serviceFactory);
				});
				const plugin = definePlugin(() => {
					dependsOn(servicePlugin.id);
					onBeforeDestroy(() => {
						[ , getEmitter ] = callback();
					});
				});

				const app = createApp([
					plugin,
					servicePlugin,
				]);

				// exec
				removePlugin(plugin.id, app); // trigger the plugin's teardown

				// check
				getEmitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledTimes(0); // listener should not have been set so no possible invocation
				expectPrettyWarn(
					warnSpy,
					new Error('Calling onEvent() during the teardown phase of a plugin is a noop, did you use the wrong hook ?'),
				);
			});
			it('should warn and skip when invoked during `destroyed`', ({ warnSpy }) => {
				// setup
				const servicePlugin = definePlugin('service', () => {
					addService('service', serviceFactory);
				});
				const plugin = definePlugin(() => {
					dependsOn(servicePlugin.id);

					const pluginInstance = getActivePlugin();
					pluginInstance?.hooks.on('destroyed', () => {
						[ , getEmitter ] = callback();
					});
				});

				const app = createApp([
					plugin,
					servicePlugin,
				]);

				// exec
				removePlugin(plugin.id, app); // trigger the plugin's teardown

				// check
				getEmitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledTimes(0); // listener should not have been set so no possible invocation
				expectPrettyWarn(
					warnSpy,
					new Error('Calling onEvent() during the destroyed phase of a plugin is a noop, did you use the wrong hook ?'),
				);
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
