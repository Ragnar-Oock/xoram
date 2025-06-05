import { describe, expect, vi } from 'vitest';
import {
	addPlugins,
	addService,
	createApp,
	definePlugin,
	defineService,
	onCreated,
	removePlugin,
	type Service,
} from '../../../src';
import { getActivePlugin } from '../../../src/plugins/active-plugin';
import { expectPrettyWarn } from '../../fixture/expect.fixture';
import { it } from '../../fixture/test.fixture';

declare module '../../../src' {
	interface ServiceCollection {
		// mock service used in addService test suite
		addServiceTestService: Service<Record<string, unknown>>;
	}
}


const addServiceTestServiceId = 'addServiceTestService';
const addServiceTestService = defineService<Record<string, unknown>>();

describe('addService', () => {
	describe('service registration', () => {
		describe('invocation', () => {
			it('should warn when called in a hook', ({ warnSpy }) => {
				createApp([
					definePlugin(() => {
						onCreated(() => {
							addService(addServiceTestServiceId, addServiceTestService);
						});
					}),
				]);

				expectPrettyWarn(warnSpy, new Error('addService can\'t be invoked outside of a plugin setup function.'));
			});
			it('should warn when called outside a plugin', ({ warnSpy }) => {
				addService(addServiceTestServiceId, addServiceTestService);

				expectPrettyWarn(warnSpy, new Error('addService can\'t be invoked outside of a plugin setup function.'));
			});
			it('should add the service to the application if none exist with the same id', () => {
				const app = createApp([
					definePlugin(() => {
						addService(addServiceTestServiceId, addServiceTestService);
					}),
				]);

				expect(app.services).toHaveProperty(addServiceTestServiceId);
			});
			it('should warn and skip if a service with the same id already exist on the application', ({ warnSpy }) => {
				const service1 = defineService<Record<string, unknown>>()();
				const service2 = defineService<Record<string, unknown>>()();

				const app = createApp([
					definePlugin(() => {
						addService(addServiceTestServiceId, service1);
						addService(addServiceTestServiceId, service2);
					}),
				]);

				expect(app.services.addServiceTestService).toBe(service1);
				expectPrettyWarn(
					warnSpy,
					new Error(
						'A service with id "addServiceTestService" is already registered in the application, consider using an other string id or a symbol. Skipping.'),
				);
			});
		});
		describe('life cycle', () => {
			it('should fire `beforeServiceAdded` on the application during the plugin\'s mount phase', () => {
				const app = createApp([]);
				let phase: undefined | string;

				app.emitter.on('beforeServiceAdded', () => {
					phase = getActivePlugin()?.phase;
				});

				addPlugins([
					definePlugin(() => {
						addService(addServiceTestServiceId, addServiceTestService);
					}),
				], app);

				expect(phase).toBe('mount');
			});
			it('should fire `serviceAdded` on the application during the plugin\'s mount phase', () => {
				const app = createApp([]);
				let phase: undefined | string;

				app.emitter.on('serviceAdded', () => {
					phase = getActivePlugin()?.phase;
				});

				addPlugins([
					definePlugin(() => {
						addService(addServiceTestServiceId, addServiceTestService);
					}),
				], app);

				expect(phase).toBe('mount');
			});
			it('should fire `serviceAdded` after `beforeServiceAdded`', () => {
				const app = createApp([]);
				const callOrder: string[] = [];
				app.emitter.on('serviceAdded', () => callOrder.push('serviceAdded'));
				app.emitter.on('beforeServiceAdded', () => callOrder.push('beforeServiceAdded'));

				addPlugins([
					definePlugin(() => {
						addService(addServiceTestServiceId, addServiceTestService);
					}),
				], app);

				expect(callOrder).toStrictEqual([ 'beforeServiceAdded', 'serviceAdded' ]);
			});
		});
	});
	describe('automatic removal', () => {
		it('should remove the service when the plugin that added it is removed', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);

			removePlugin(plugin.id, app);

			expect(app.services).not.toHaveProperty(addServiceTestServiceId);
		});
		it('should not remove a service of same id when the registration failed for duplicated id', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([
				definePlugin(() => {
					addService(addServiceTestServiceId, addServiceTestService);
				}),
				plugin,
			]);

			removePlugin(plugin.id, app);

			expect(app.services).toHaveProperty(addServiceTestServiceId);
		});
		it('should emits a `before_destroy` event', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			const spy = vi.fn();
			const service = app.services[addServiceTestServiceId];
			service.emitter.on('before_destroy', spy);

			removePlugin(plugin.id, app);

			expect(spy).toHaveBeenCalledExactlyOnceWith({ service });
		});
		it('should remove the service during the plugin\'s destroyed phase', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			let phase: undefined | string;
			const service = app.services[addServiceTestServiceId];
			service.emitter.on('before_destroy', () => {
				phase = getActivePlugin()?.phase;
			});

			removePlugin(plugin.id, app);

			expect(phase).toBe('destroyed');
		});
		it('should fire `beforeServiceRemoved` on the application during the plugin\'s destroyed phase', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			let phase: undefined | string;

			app.emitter.on('beforeServiceRemoved', () => {
				phase = getActivePlugin()?.phase;
			});

			removePlugin(plugin.id, app);

			expect(phase).toBe('destroyed');
		});
		it('should fire `serviceRemoved` on the application during the plugin\'s destroyed phase', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			let phase: undefined | string;

			app.emitter.on('serviceRemoved', () => {
				phase = getActivePlugin()?.phase;
			});

			removePlugin(plugin.id, app);

			expect(phase).toBe('destroyed');
		});
		it('should fire `serviceRemoved` after `before_destroy`', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			const callOrder: string[] = [];

			app.emitter.on('serviceRemoved', () => callOrder.push('serviceRemoved'));
			app.services.addServiceTestService.emitter.on('before_destroy', () => callOrder.push('before_destroy'));

			removePlugin(plugin.id, app);

			expect(callOrder).toStrictEqual([ 'before_destroy', 'serviceRemoved' ]);
		});
		it('should fire `before_destroy` after `beforeServiceRemoved`', () => {
			const plugin = definePlugin(() => {
				addService(addServiceTestServiceId, addServiceTestService);
			});
			const app = createApp([ plugin ]);
			const callOrder: string[] = [];

			app.services.addServiceTestService.emitter.on('before_destroy', () => callOrder.push('before_destroy'));
			app.emitter.on('beforeServiceRemoved', () => callOrder.push('beforeServiceRemoved'));

			removePlugin(plugin.id, app);

			expect(callOrder).toStrictEqual([ 'beforeServiceRemoved', 'before_destroy' ]);
		});
	});
});