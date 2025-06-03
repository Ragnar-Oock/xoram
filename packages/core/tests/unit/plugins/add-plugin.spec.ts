// oxlint-disable no-magic-numbers
import { describe, expect, vi } from 'vitest';
import type { ApplicationHooks } from '../../../src';
import { addPlugins, createApp, definePlugin, dependsOn, onBeforeCreate, onCreated } from '../../../src';
import { pluginSymbol } from '../../../src/application/application.type';
import borisPlugin from '../../dummies/boris.plugin';
import { noop } from '../../dummies/noop';
import personPlugin from '../../dummies/person.plugin';
import { expectPrettyWarn } from '../../fixture/expect.fixture';
import { it } from '../../fixture/test.fixture';

// TODO:
// - test addPlugin
// - test hook invocation order
// - test hooks are invoked safely (no error bubbling up)

describe('addPlugins', () => {
	it('should add plugins without dependencies', ({ autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([
			definePlugin(() => {
				onCreated(() => {
					// exec
					addPlugins([ personPlugin ]);
				});
			}),
		]));

		// validate
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
	});

	it('should add plugins that depend on instanced plugins', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp(
			[
				personPlugin,
				definePlugin(() => {
					onCreated(() => {
						// exec
						addPlugins([ borisPlugin ]);
					});
				}),
			], { id: task.id }));

		// validate
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
	});

	it('should add plugins that depends on plugins of the same batch', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(
			createApp([
				definePlugin(() => {
					onCreated(() => {
						// exec
						addPlugins([ borisPlugin, personPlugin ]);
					});
				}),
			], { id: task.id }));

		// check
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
	});

	it('should add plugins that depends on a mixed set of instanced plugins and of the same batch', ({
		task,
		autoDestroy,
	}) => {
		// setup
		const mixedDependencyPlugin = definePlugin(() => {
			dependsOn(borisPlugin.id);
			dependsOn(personPlugin.id);
		});
		const app = autoDestroy(
			createApp([
				personPlugin,
				definePlugin(() => {
					onCreated(() => {
						// exec
						addPlugins([
							borisPlugin,
							mixedDependencyPlugin,
						]);
					});
				}),
			], { id: task.id }));

		// check
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(mixedDependencyPlugin.id)).toBe(true);
	});

	it(
		'should gracefully fail if plugins of the batch have a circular dependency between themselves',
		({ autoDestroy }) => {
			const pluginA = definePlugin(() => {
				dependsOn(pluginB.id);
			});
			const pluginB = definePlugin(() => {
				dependsOn(pluginA.id);
			});

			const app = autoDestroy(createApp([]));

			const spyOnFailedPluginRegistration = vi.fn();

			app.emitter.on('failedPluginRegistration', spyOnFailedPluginRegistration);

			// exec / check
			expect(() => addPlugins([ pluginA, pluginB ], app)).not.toThrow();
			// check
			expect(spyOnFailedPluginRegistration).toHaveBeenCalledExactlyOnceWith({
				app,
				reason: new Error(`The plugin "${ String(pluginA.id) }" declares a dependency that directly or indirectly depends on it.`),
			} satisfies ApplicationHooks['failedPluginRegistration']);
		},
	);

	// we can't introduce dependency cycles in an app where all plugin dependencies are already met
	// that won't be true when we add optional dependencies, will that pose any issue ?

	it('should accept an application context', ({ autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([]));

		// exec / check
		expect(() => addPlugins([ definePlugin(noop) ], app)).not.toThrow();
	});

	it(
		'should error out if no application context is provided and execution is outside of an application context',
		() => {
			// exec / check
			expect(() => addPlugins([ definePlugin(noop) ]))
				.toThrow(new TypeError(
					'addPlugin called outside of an application context and no app instance passed as parameter.'));
		},
	);

	it('should add the plugin to the application', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const plugin = definePlugin(task.id, noop);

		// exec
		addPlugins([ plugin ], app);

		// check
		expect(app[pluginSymbol].has(plugin.id)).toBeTruthy();
	});

	it('should build the plugin', ({ task, autoDestroy }) => {
		//setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const setup = vi.fn();

		// exec
		addPlugins([ definePlugin(setup) ], app);

		// check
		expect(setup).toHaveBeenCalledExactlyOnceWith(); // setup takes no arguments
	});

	it('should invoke the beforeCreate hook', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const spy = vi.fn();

		// exec
		addPlugins([
			definePlugin(() => {
				onBeforeCreate(spy);
			}),
		], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith(app);
	});

	it('should invoke the beforeCreate hook before adding the plugin to the application', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const plugin = definePlugin(() => {
			onBeforeCreate(spy);
		});

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(plugin.id)).toBeFalsy();
		});

		// exec
		addPlugins([ plugin ], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith(app);
	});

	it('should invoke the created hook', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const spy = vi.fn();

		// exec
		addPlugins([
			definePlugin(() => {
				onCreated(spy);
			}),
		], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith(app);
	});

	it('should invoke the created hook after adding the plugin to the application', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const plugin = definePlugin(() => {
			onCreated(spy);
		});

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(plugin.id)).toBeTruthy();
		});

		// exec
		addPlugins([ plugin ], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith(app);
	});

	it('should invoke the beforePluginRegistration hook', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const spy = vi.fn();

		app.emitter.on('beforePluginRegistration', spy);

		// exec
		const plugin = definePlugin(noop);
		addPlugins([ plugin ], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith({ app, plugin: app[pluginSymbol].get(plugin.id) });
	});

	it('should invoke the beforePluginRegistration hook before the plugin is added to the application', ({
		task,
		autoDestroy,
	}) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const plugin = definePlugin(noop);

		// checks
		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(plugin.id)).toBeFalsy();
		});

		app.emitter.on('beforePluginRegistration', spy);

		// exec
		addPlugins([ plugin ], app);
	});

	it('should invoke the beforePluginRegistration hook before the beforeCreate hook', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const spy = vi.fn();

		app.emitter.on('beforePluginRegistration', () => spy('beforePluginRegistration'));

		// exec
		addPlugins([
			definePlugin(() => {
				onBeforeCreate(() => spy('beforeCreate'));
			}),
		], app);

		// check
		// oxlint-disable no-magic-number
		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenNthCalledWith(1, 'beforePluginRegistration');
		expect(spy).toHaveBeenNthCalledWith(2, 'beforeCreate');
		// oxlint-enable
	});

	it('should invoke the pluginRegistered hook', ({ task, autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([], { id: task.id }));
		const spy = vi.fn();

		app.emitter.on('pluginRegistered', spy);

		// exec
		const plugin = definePlugin(task.id, noop);
		addPlugins([ plugin ], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith({ app, plugin: app[pluginSymbol].get(plugin.id) });
	});

	it('should invoke the pluginRegistered hook after the plugin is added to the application', ({ autoDestroy }) => {
		// setup
		const app = autoDestroy(createApp([]));
		const plugin = definePlugin(noop);

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(plugin.id)).toBeTruthy();
		});

		app.emitter.on('pluginRegistered', spy);

		// exec
		addPlugins([ plugin ], app);

		// check
		expect(spy).toHaveBeenCalledExactlyOnceWith({ app, plugin: app[pluginSymbol].get(plugin.id) });
	});

	describe('edge cases', () => {
		it('should warn when a non plugin is passed in', ({ autoDestroy, warnSpy }) => {
			const app = autoDestroy(createApp([ personPlugin ]));
			const notAPlugin = vi.fn();

			expect(() => addPlugins(
				// @ts-expect-error we are checking that this fails
				[ notAPlugin ],
				app,
			)).not.toThrow();

			// expect(warnSpy).toHaveBeenCalledExactlyOnceWith('addPlugin() was passed a non plugin item', notAPlugin);
			expectPrettyWarn(warnSpy, 'addPlugin() was passed a non plugin item', notAPlugin);
		});
	});
});

describe.skip('addPlugin', () => {
	// all of the above ?
});