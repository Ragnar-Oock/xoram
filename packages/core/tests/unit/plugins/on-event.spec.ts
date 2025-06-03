// eslint-disable no-magic-numbers
// eslint-disable prefer-await-to-callbacks
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

type OnEventTestNotifications = {
	eventA: typeof eventA;
	eventB: typeof eventB;
};

declare module '../../../src' {
	interface ServiceCollection {
		onEventTestService: Service<OnEventTestNotifications>;
	}
}

function checkSingleEvent<notifications extends OnEventTestNotifications>(
	emitter: Emitter<notifications>,
	spy: Mock,
): void {
	emitter.emit('eventA', eventA);

	expect(spy).toHaveBeenCalledExactlyOnceWith(eventA);
}

function checkMultiEvent<notifications extends OnEventTestNotifications>(
	emitter: Emitter<notifications>,
	spy: Mock,
): void {
	emitter.emit('eventA', eventA);
	emitter.emit('eventB', eventB);

// eslint-disable-next-line no-magic-numbers
	expect(spy).toHaveBeenCalledTimes(2);
	expect(spy).toHaveBeenCalledWith(eventA);
	expect(spy).toHaveBeenCalledWith(eventB);
}

function checkWildcardEvent<notifications extends OnEventTestNotifications>(
	emitter: Emitter<notifications>,
	spy: Mock,
): void {
	emitter.emit('eventA', eventA);
	emitter.emit('eventB', eventB);

// eslint-disable-next-line no-magic-numbers
	expect(spy).toHaveBeenCalledTimes(2);
	expect(spy).toHaveBeenCalledWith('eventA', eventA);
	expect(spy).toHaveBeenCalledWith('eventB', eventB);
}

type OverloadCase = [
	name: string,
	callback: (onEvent?: () => void) => [ cleanup: () => void, emitter: (app: Application) => Emitter<OnEventTestNotifications> ]
]

function getServiceEmitter(app: Application): Emitter<OnEventTestNotifications> {
	return app.services.onEventTestService.emitter as unknown as Emitter<OnEventTestNotifications>;
}

describe('onEvent', () => {
	let emitter: Emitter<OnEventTestNotifications>;
	let handler: Mock;
	let serviceFactory: () => Service<OnEventTestNotifications>;


	beforeEach(() => {
		emitter = mitt();
		handler = vi.fn();
		serviceFactory = defineService<OnEventTestNotifications>();
	});

	// eslint-disable explicit-function-return-type
	const overload1Cases = [
		[
			'overload 1:1 onEvent(emitter, \'*\', handler)',
			(callback) => [
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
	] as const satisfies OverloadCase[];
	const overload2Cases = [
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
	] as const satisfies OverloadCase[];
	const overload3Cases = [
		[
			'overload 3:1 onEvent(app => app.services.service.emitter, \'*\', handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService.emitter, '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:2 onEvent(app => app.services.service.emitter, \'eventA\', handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService.emitter, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:3 onEvent(app => app.services.service.emitter, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService.emitter, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 3:3 (+single event) onEvent(app => app.services.service.emitter, [\'eventA\'], handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService.emitter, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
	] as const satisfies OverloadCase[];
	const overload4Cases = [
		[
			'overload 4:1 onEvent(app => app.services.service, \'*\', handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService, '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:2 onEvent(app => app.services.service, \'eventA\', handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService, 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:3 onEvent(app => app.services.service, [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService, [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 4:3 (+single event) onEvent(app => app.services.service, [\'eventA\'], handler)',
			(callback) => [
				onEvent(app => app.services.onEventTestService, [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
	] as const satisfies OverloadCase[];
	const overload5Cases = [
		[
			'overload 5:1 onEvent(\'service\', \'*\', handler)',
			(callback) => [
				onEvent('onEventTestService', '*', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:2 onEvent(\'service\', \'eventA\', handler)',
			(callback) => [
				onEvent('onEventTestService', 'eventA', (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:3 onEvent(\'service\', [\'eventA\', \'eventB\'], handler)',
			(callback) => [
				onEvent('onEventTestService', [ 'eventA', 'eventB' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
		[
			'overload 5:3 (+single event) onEvent(\'service\', [\'eventA\'], handler)',
			(callback) => [
				onEvent('onEventTestService', [ 'eventA' ], (...args) => {
					handler(...args);
					callback?.();
				}), getServiceEmitter,
			],
		],
	] as const satisfies OverloadCase[];
	// eslint-enable explicit-function-return-type

	const overloadsCases = [
		...overload1Cases,
		...overload2Cases,
		...overload3Cases,
		...overload4Cases,
		...overload5Cases,
	] as const satisfies OverloadCase[];


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
					addService('onEventTestService', serviceFactory);
					onEvent(app => app.services.onEventTestService.emitter, '*', handler);
				}),
			]);
			checkWildcardEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle single event listener with direct emitter getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent(app => app.services.onEventTestService.emitter, 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle multiple event listeners with direct emitter getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);

					onEvent(app => app.services.onEventTestService.emitter, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.onEventTestService.emitter, handler);
		});

		// --- Getter: app => app.services.service (returns object with emitter) ---
		it('should handle wildcard event listener with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent(app => app.services.onEventTestService, '*', handler);
				}),
			]);

			checkWildcardEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle single event listener with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent(app => app.services.onEventTestService, 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle multiple event listeners with service object getter', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent(app => app.services.onEventTestService, [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.onEventTestService.emitter, handler);
		});

		// --- Service ID string ---
		it('should handle wildcard event listener with service ID string', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent('onEventTestService', '*', handler);
				}),
			]);

			checkWildcardEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle single event listener with service ID string', () => {
			onEvent('onEventTestService', 'eventA', handler);
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent('onEventTestService', 'eventA', handler);
				}),
			]);

			checkSingleEvent(app.services.onEventTestService.emitter, handler);
		});

		it('should handle multiple event listeners with service ID string', () => {
			const app = createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory);
					onEvent('onEventTestService', [ 'eventA', 'eventB' ], handler);
				}),
			]);

			checkMultiEvent(app.services.onEventTestService.emitter, handler);
		});
	});

	describe('correct target resolution', () => {
		describe.for<[ string, OverloadCase[] ]>([
			[
				'should use the target directly when given a direct emitter',
				overload1Cases,
			],
			[
				'should use the emitter prop when given an emitter carrying object',
				overload2Cases,
			],
			[
				'should use the direct emitter returned by the getter when given a direct emitter getter',
				overload3Cases,
			],
			[
				'should use the emitter prop on the object returned by the getter when given a emitter object getter',
				overload4Cases,
			],
			[
				'should use the emitter of the service resolved on the app instance when given an id',
				overload5Cases,
			],
		])('%s', ([ _, cases ]) => {
			it.for<OverloadCase>(cases)('%s', ([ _, callback ]) => {
				let getEmitter: (app: Application) => Emitter<OnEventTestNotifications>;

				const spy = vi.fn();
				const app = createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory());
						[ , getEmitter ] = callback(spy);
					}),
				]);

				// @ts-expect-error getEmitter will always be initialized here and if it's not we want the test to fail because
				// of the type error
				getEmitter(app).emit('eventA', eventA);

				expect(spy).toHaveBeenCalledOnce();
			});
		});
	});

	describe.runIf(import.meta.env.DEV)('incorrect target resolution', () => {
		it.for<OverloadCase>([
			[
				'overload 5:1 onEvent(\'bob\', \'*\', handler)',
				(callback) => [
					onEvent('bob', '*', (...args) => {
						handler(...args);
						callback?.();
					}), getServiceEmitter,
				],
			],
			[
				'overload 5:2 onEvent(\'bob\', \'eventA\', handler)',
				(callback) => [
					onEvent('bob', 'eventA', (...args) => {
						handler(...args);
						callback?.();
					}), getServiceEmitter,
				],
			],
			[
				'overload 5:3 onEvent(\'bob\', [\'eventA\', \'eventB\'], handler)',
				(callback) => [
					onEvent('bob', [ 'eventA', 'eventB' ], (...args) => {
						handler(...args);
						callback?.();
					}), getServiceEmitter,
				],
			],
			[
				'overload 5:3 (+single event) onEvent(\'bob\', [\'eventA\'], handler)',
				(callback) => [
					onEvent('bob', [ 'eventA' ], (...args) => {
						handler(...args);
						callback?.();
					}), getServiceEmitter,
				],
			],
		])('should warn when given an invalid service id: %s', ([ , callback ], { warnSpy }) => {
			createApp([
				definePlugin(() => {
					addService('onEventTestService', serviceFactory());
					callback();
				}),
			]);

			expectPrettyWarn(warnSpy, new Error(`onEvent was invoked with an incorrect service id "bob".`));
		});

		describe.for<[ string, string | string[] ]>([
			[ 'overload x:1 *', '*' ],
			[ 'overload x:2 \'eventA\'', 'eventA' ],
			[ 'overload x:3 [\'eventA\', \'eventB\']', [ 'eventA', 'eventB' ] ],
			[ 'overload x:3 (+single event) [\'eventA\']', [ 'eventA' ] ],
		])('%s', ([ _, events ]) => {
			it.for<[ string, unknown ]>([
				[ 'undefined', undefined ],
// eslint-disable-next-line no-null
				[ 'null', null ],
				[ 'number', 0 ],
			])('should warn when given a %s as target', ([ typeofTarget, target ], { warnSpy }) => {
				createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory());
						// @ts-expect-error all targets here are invalid
						onEvent(target, events, handler);
					}),
				]);

				expect(handler).not.toHaveBeenCalled();
				expectPrettyWarn(
					warnSpy,
					new TypeError(`incorrect target provided to onEvent, typeof target === ${ typeofTarget }, expected string, symbol, function or object`),
				);
			});
		});

	});

	describe.runIf(import.meta.env.DEV)('incorrect invocation location', () => {
		describe.for<OverloadCase>(overloadsCases)('%s', ([ _, callback ]) => {
			it('should warn when invoked outside an application context', ({ warnSpy }) => {
				callback();
				expectPrettyWarn(warnSpy, new Error('onEvent was invoked outside of a plugin setup function or hook.'));
			});
		});
	});

	describe('handler invocation', () => {
		it('should preserve the original this binding', () => {
			const bob = {
				handler(): void {
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
			const service = defineService<OnEventTestNotifications>()();
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
				getEmitter: (app: Application) => Emitter<OnEventTestNotifications>;
			it('should return a nullary void function', () => {
				createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory);

						[ cleanup ] = callback();
					}),
				]);

				expect(cleanup).not.toBe(noop);
				expect(cleanup()).toBeUndefined();
			});
			it('should stop handler from being called after cleanup', () => {
				const app = createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory);

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
						addService('onEventTestService', serviceFactory);

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
						addService('onEventTestService', serviceFactory);

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

			let getEmitter: (app: Application) => Emitter<OnEventTestNotifications>;
			let pluginPhase: string | undefined;

			beforeEach(() => {
				pluginPhase = 'unset';
			});


			it('should wait for the `active` phase when invoked during `setup`', ({ warnSpy }) => {
				const app = createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory);
						const plugin = getActivePlugin();

						[ , getEmitter ] = callback(() => {pluginPhase = plugin?.phase;});
					}),
				]);

				getEmitter(app).emit('eventA', eventA);

				expect(handler).toHaveBeenCalledOnce();
				expect(warnSpy).toHaveBeenCalledTimes(0); // no warning logged
				expect(pluginPhase).toBe('active');
			});
			it('should wait for the `active` phase when invoked during `mount`', ({ warnSpy }) => {
				// setup
				const app = createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory);
						const plugin = getActivePlugin();

						onBeforeCreate(() => {
							[ , getEmitter ] = callback(() => {pluginPhase = plugin?.phase;});
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
				const app = createApp([
					definePlugin(() => {
						addService('onEventTestService', serviceFactory);
						const plugin = getActivePlugin();

						onCreated(() => {
							[ , getEmitter ] = callback(() => {pluginPhase = plugin?.phase;});
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
					addService('onEventTestService', serviceFactory);
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
					addService('onEventTestService', serviceFactory);
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
