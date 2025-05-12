import { beforeEach, describe, expect, it, type Mock, type MockInstance, vi } from 'vitest';
import {
	asyncPlugin as defineAsyncPlugin,
	createApp,
	definePlugin,
	dependsOn,
	destroyApp,
	removePlugin,
} from '../../../src';
import { pluginSymbol } from '../../../src/application/application.type';
import { getActivePlugin } from '../../../src/plugins/active-plugin';
import { noop } from '../../dummies/noop';
import { expectPrettyWarn } from '../../fixture/expect.fixture';

const purePlugin = definePlugin('A', noop);
const dependentPlugin = definePlugin('B', () => {
	dependsOn(purePlugin.id);
});
const circularDep1 = definePlugin('C1', () => {
	dependsOn(circularDep2.id);
});
const circularDep2 = definePlugin('C2', () => {
	dependsOn(circularDep1.id);
});

describe('defineAsyncPlugin', () => {
	let done: PromiseWithResolvers<void>,
		when: PromiseWithResolvers<void>,
		spy: Mock,
		warnSpy: MockInstance<(...data: any[]) => void>;
	beforeEach(() => {
		done = Promise.withResolvers<void>();
		when = Promise.withResolvers<void>();
		spy = vi.fn();
		warnSpy = vi.spyOn(console, 'warn');
	});
	describe('it capture errors thrown by the callbacks and abort', () => {
		it('should capture errors thrown synchronously by "when"', () => {
			const error = new Error('catch me');
			const app = createApp([
				defineAsyncPlugin(
					async () => purePlugin,
					() => {
						throw error;
					},
					[],
				),
			], {
				onError: spy,
			});

			expect(spy).toHaveBeenCalledExactlyOnceWith(error);
			expect(app[pluginSymbol].has(purePlugin.id), 'plugins should not be loaded if an error occurred').toBeFalsy();
		});
		it('should capture errors thrown asynchronously by "when"', async () => {
			const error = new Error('catch me');
			const app = createApp([
				defineAsyncPlugin(
					async () => purePlugin,
					async () => {
						throw error;
					},
					[],
					() => done.resolve(),
				),
			], {
				onError: spy,
			});

			await done.promise;

			expect(spy).toHaveBeenCalledExactlyOnceWith(error);
			expect(app[pluginSymbol].has(purePlugin.id), 'plugins should not be loaded if an error occurred').toBeFalsy();
		});
		it('should capture errors thrown synchronously by "importer"', async () => {
			const error = new Error('catch me');
			createApp([
				defineAsyncPlugin(
					() => {
						throw error;
					},
					async () => void 0,
					[],
					() => done.resolve(),
				),
			], {
				onError: spy,
			});

			await done.promise;

			expect(spy).toHaveBeenCalledExactlyOnceWith(error);
		});
		it('should capture errors thrown asynchronously by "importer"', async () => {
			createApp([
				defineAsyncPlugin(
					async () => {
						throw new Error('catch me');
					},
					async () => void 0,
					[],
					() => done.resolve(),
				),
			], {
				onError: spy,
			});

			await done.promise;

			expect(spy).toHaveBeenCalledExactlyOnceWith(new Error('catch me'));
		});
	});
	describe('it awaits the condition', () => {
		it('should invoke the importer after the "when" resolves', async () => {
			const importer = vi.fn(async () => purePlugin);

			createApp([ defineAsyncPlugin(importer, () => when.promise) ]);

			expect(importer).toHaveBeenCalledTimes(0);

			when.resolve();
			await when.promise;
			expect(importer).toHaveBeenCalledOnce();
		});
		it('should provide the app instance to "when"', () => {
			const when = vi.fn(async _ => void 0);

			const app = createApp([ defineAsyncPlugin(async () => purePlugin, when) ]);

			expect(when).toHaveBeenCalledExactlyOnceWith(app);
		});
		it('should invoke "when" during the "active" phase of the returned plugin', () => {
			let pluginPhase;

			createApp([
				defineAsyncPlugin(async () => purePlugin, async () => {
					pluginPhase = getActivePlugin()?.phase;
				}),
			]);

			expect(pluginPhase).toBe('active');
		});
	});
	describe('it expect dependencies', () => {
		it('should prevent loading the returned plugin if at least one of the dependencies is missing', () => {
			expect(() => createApp([
				defineAsyncPlugin(
					async () => purePlugin,
					async () => void 0,
					[ dependentPlugin.id ],
				),
			])).toThrow(new Error('Application creation failed'));

		});
		it('should be loaded after the dependencies', () => {
			let hasPluginB = false;

			createApp([
				purePlugin,
				defineAsyncPlugin(
					async () => dependentPlugin,
					async (app) => {
						hasPluginB = app[pluginSymbol].has(purePlugin.id);
					},
					[ purePlugin.id ],
				),
			]);

			expect(hasPluginB).toBeTruthy();
		});
	});
	describe('it silently skip plugins already loaded', () => {
		it('should not throw', () => {
			expect(() => {
				createApp([
					purePlugin,
					defineAsyncPlugin(
						async () => purePlugin,
						async () => void 0,
					),
				]);
			}).not.toThrow();
		});
		it('should not load the duplicated plugin', async () => {
			const app = createApp([
				purePlugin,
				defineAsyncPlugin(
					async () => purePlugin,
					async () => when.promise,
				),
			]);

			app.emitter.on('beforePluginRegistration', spy);

			expect(spy).toHaveBeenCalledTimes(0);

		});
	});
	describe('it returns a valid plugins', () => {
		it('should have an id', () => {
			const plugin = defineAsyncPlugin(async () => purePlugin, async () => void 0);

			expect(plugin).toHaveProperty('id');
			expect(plugin.id).toBeTypeOf('symbol');
		});
		it('should be a build function', () => {
			const plugin = defineAsyncPlugin(async () => purePlugin, async () => void 0);

			expect(plugin).toBeTypeOf('function');
		});
	});
	describe('it removes itself when done', () => {
		it('should remove itself from the app when the plugins are added', async () => {
			const plugin = defineAsyncPlugin(async () => purePlugin, async () => void 0, [], () => done.resolve());
			const app = createApp([ plugin ]);

			await done.promise;

			expect(app[pluginSymbol].has(plugin.id)).toBeFalsy();
		});
		// todo should it remove itself in case of failure ?
	});

	// todo is this really necessary ?
	describe('it respects the interface', () => {
		it('should accept an "importer" with a single plugin', async () => {
			const app = createApp([
				defineAsyncPlugin(async () => purePlugin, async () => void 0, [], () => done.resolve()),
			]);

			await done.promise;

			expect(app[pluginSymbol].has(purePlugin.id)).toBeTruthy();
		});
		it('should accept an "importer" with an array of plugins', async () => {
			const app = createApp([
				defineAsyncPlugin(async () => [ purePlugin, dependentPlugin ], async () => void 0, [], () => done.resolve()),
			]);

			await done.promise;

			expect(app[pluginSymbol].has(purePlugin.id)).toBeTruthy();
			expect(app[pluginSymbol].has(dependentPlugin.id)).toBeTruthy();
		});
		it('should accept a list of dependencies', async () => {
			const app = createApp([
				purePlugin,
				defineAsyncPlugin(
					async () => [ dependentPlugin ],
					async () => void 0,
					[ purePlugin.id ],
					() => done.resolve(),
				),
			]);

			await done.promise;

			expect(app[pluginSymbol].has(purePlugin.id)).toBeTruthy();
			expect(app[pluginSymbol].has(dependentPlugin.id)).toBeTruthy();
		});
	});

	describe('edge cases', () => {
		it('should warn when importer returns an empty array', async () => {
			createApp([
				defineAsyncPlugin(
					// @ts-expect-error we are checking that this triggers a warning
					async () => [],
					async () => void 0,
					[],
					() => done.resolve(),
				),
			]);

			await done.promise;

			expectPrettyWarn(
				warnSpy,
				new Error('defineAsyncPlugin() received no plugin from the importer, did you forget to return them ?'),
			);
		});
		it('should not invoke the importer when "when" resolves after the app is destroyed', async () => {
			const importer = vi.fn(async () => purePlugin);
			const app = createApp([ defineAsyncPlugin(importer, () => when.promise, [], () => done.resolve()) ]);

			destroyApp(app);
			when.resolve();

			await done.promise;

			expect(importer).toHaveBeenCalledTimes(0);
		});
		it('should not invoke the importer when "when" resolves after the plugin is removed', async () => {
			const importer = vi.fn(async () => purePlugin);
			const plugin = defineAsyncPlugin(importer, () => when.promise, [], () => done.resolve());

			const app = createApp([ plugin ]);

			removePlugin(plugin.id, app);
			when.resolve();

			await done.promise;

			expect(importer).toHaveBeenCalledTimes(0);
		});
		it('should gracefully fail to load plugins with circular dependencies', async () => {

			const app = createApp([
				defineAsyncPlugin(async () => [ circularDep1, circularDep2 ], () => when.promise, [], () => done.resolve()),
			]);

			app.emitter.on('failedPluginRegistration', spy);

			when.resolve();
			await done.promise;

			expect(app[pluginSymbol].has(circularDep1.id)).toBeFalsy();
			expect(app[pluginSymbol].has(circularDep2.id)).toBeFalsy();
			expect(warnSpy).toHaveBeenCalledOnce();
			expect(spy).toHaveBeenCalledExactlyOnceWith({
				app,
				reason: new Error(`The plugin "${ String(circularDep1.id) }" declares a dependency that directly or indirectly depends on it.`),
			});
		});
		it('should gracefully fail to load plugins with missing dependencies', async () => {
			const app = createApp([
				defineAsyncPlugin(async () => [ dependentPlugin ], () => when.promise, [], () => done.resolve()),
			]);

			app.emitter.on('failedPluginRegistration', spy);

			when.resolve();
			await done.promise;

			expect(app[pluginSymbol].has(dependentPlugin.id)).toBeFalsy();
			expect(warnSpy).toHaveBeenCalledOnce();
			expect(spy).toHaveBeenCalledExactlyOnceWith({
				app,
				reason: new Error(`The plugin "${ String(dependentPlugin.id) }" depends on "${ String(purePlugin.id) }" but it is not in the list of provided plugins. Did you forget to register it ?`),
			});
		});
		it('should gracefully fail to load non plugins returned by "importer"', async () => {
			const notAPlugin = vi.fn();

			const app = createApp([
				defineAsyncPlugin(
					// @ts-expect-error we are checking that this would lead to a warning
					async () => [ notAPlugin ],
					() => when.promise,
					[],
					() => done.resolve(),
				),
			]);
			app.emitter.on('failedPluginRegistration', spy);

			when.resolve();
			await done.promise;

			expectPrettyWarn(warnSpy, 'addPlugin() was passed a non plugin item', notAPlugin);
		});
	});

	describe('dev mode', () => {
		it('should warn if importer is synchronous and proceed as usual', async () => {
			let app = createApp([
				defineAsyncPlugin(
					// @ts-expect-error we are checking that a warning is logged in this case
					() => purePlugin,
					async () => when.promise,
					[],
					() => done.resolve(),
				),
			]);

			when.resolve();

			await done.promise;


			expectPrettyWarn(warnSpy, new Error(
				'defineAsyncPlugin() called with a synchronous importer. This will prevent the plugins added asynchronously from being split into their own chunk when building.'));
			expect(app[pluginSymbol].has(purePlugin.id)).toBeTruthy();
		});
		it('should warn if "when" is synchronous and proceed as usual', async () => {
			const app = createApp([
				defineAsyncPlugin(
					async () => purePlugin, // fakes an async import
					// @ts-expect-error we are checking that a warning is logged in this case
					() => void 0,
					[],
					() => done.resolve(),
				),
			]);

			await done.promise;


			expectPrettyWarn(warnSpy, new Error(
				'asyncPlugin() called with synchronous condition. If you want to load plugins synchronously use addPlugins() instead.'));
			expect(app[pluginSymbol].has(purePlugin.id)).toBeTruthy();
		});
		it('should warn if importer returns empty array and proceed as usual', async () => {
			createApp([
				defineAsyncPlugin(
					// @ts-expect-error we are checking that this triggers a warning
					async () => [], // fakes broken async import
					async () => void 0,
					[],
					() => done.resolve(),
				),
			]);

			await done.promise;

			expectPrettyWarn(
				warnSpy,
				new Error('defineAsyncPlugin() received no plugin from the importer, did you forget to return them ?'),
			);
		});
		it('should warn if importer returns undefined and proceed as usual', async () => {
			createApp([
				defineAsyncPlugin(
					// @ts-expect-error we are checking that this triggers a warning
					async () => undefined, // fakes forgotten return
					async () => void 0,
					[],
					() => done.resolve(),
				),
			]);

			await done.promise;

			expectPrettyWarn(
				warnSpy,
				new Error('defineAsyncPlugin() received no plugin from the importer, did you forget to return them ?'),
			);
		});
	});
});