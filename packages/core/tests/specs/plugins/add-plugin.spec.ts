// oxlint-disable no-magic-numbers
import { describe, expect, vi } from 'vitest';
import type { ApplicationHooks } from '../../../src';
import { addPlugins, createApp, definePlugin, dependsOn, onBeforeCreate, onCreated, pluginId } from '../../../src';
import { pluginSymbol } from '../../../src/application/application.type';
import borisPlugin from '../../dummies/boris.plugin';
import { noop } from '../../dummies/noop';
import personPlugin from '../../dummies/person.plugin';
import { it } from '../../fixture/test-with-destroyable';

// TODO:
// - test addPlugin
// - test hook invocation order
// - test hooks are invoked safely (no error bubbling up)

describe('addPlugins', () => {
	it('should add plugins without dependencies', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([definePlugin(pluginId(), () => {
				onCreated(() => {
					// exec
					addPlugins([personPlugin]);
				})
			})], {id: task.id}));

		// validate
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
	});

	it('should add plugins that depend on instanced plugins', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp(
			[
				personPlugin,
				definePlugin(pluginId(), () => {
					onCreated(() => {
						// exec
						addPlugins([borisPlugin]);
					})
				})
			], {id: task.id}));

		// validate
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
	});

	it('should add plugins that depends on plugins of the same batch', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(
			createApp([
				definePlugin(pluginId(), () => {
					onCreated(() => {
						// exec
						addPlugins([borisPlugin, personPlugin]);
					})
				})
			], { id: task.id }));

		// check
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
	});

	it('should add plugins that depends on a mixed set of instanced plugins and of the same batch', ({task, autoDestroy}) => {
		// setup
		const mixedDependencyPlugin = pluginId();
		const app = autoDestroy(
			createApp([
				personPlugin,
				definePlugin(() => {
					onCreated(() => {
						// exec
						addPlugins([
							borisPlugin,
							definePlugin(mixedDependencyPlugin, () => {
								dependsOn(borisPlugin.id);
								dependsOn(personPlugin.id);
							})
						]);
					})
				})
			], {id: task.id}));

		// check
		expect(app[pluginSymbol].has(personPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(borisPlugin.id)).toBe(true);
		expect(app[pluginSymbol].has(mixedDependencyPlugin)).toBe(true);
	});

	it('should throw if plugins of the batch have a circular dependency between themselves', ({task, autoDestroy}) => {
		// setup
		const idA = pluginId('a');
		const idB = pluginId('b');

		const pluginA = definePlugin(idA, () => {
			dependsOn(idB);
		});
		const pluginB = definePlugin(idB, () => {
			dependsOn(idA);
		})

		const app = autoDestroy(createApp([], {id: task.id}));

		const spyOnFailedPluginRegistration = vi.fn();

		app.emitter.on('failedPluginRegistration', spyOnFailedPluginRegistration);

		// exec / check
		expect(() => addPlugins([pluginA, pluginB], app)).not.toThrow();
		// check
		expect(spyOnFailedPluginRegistration).toHaveBeenCalledOnce();
		expect(spyOnFailedPluginRegistration).toHaveBeenCalledWith({
			app,
			reason: new Error(`The plugin "${String(idA)}" declares a dependency that directly or indirectly depends on it.`)
		} satisfies ApplicationHooks['failedPluginRegistration']);
	});

	// todo should this throw, warn or play a hook ?
	// todo does this even matter ?
	it.todo('should throw if a plugin with same id already exist', ({task, autoDestroy}) => {
		// setup
		const idA = pluginId('a');

		const pluginA = definePlugin(idA, () => {
			onCreated(() => console.log('created'));
		});
		const pluginB = definePlugin(idA, () => {
			onCreated(() => console.log('created'));
		})

		const app = autoDestroy(createApp([ pluginA ], {id: task.id}));

		// exec / check
		expect(() => addPlugins([pluginB], app)).toThrow();
	});
	// we can't introduce dependency cycles in an app where all plugin dependencies are already met
	// that won't be true when we add optional dependencies, will that pause any issue ?

	it('should accept an application context', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));

		// exec / check
		expect(() => addPlugins([definePlugin(pluginId('emptyPlugin'), noop)], app)).not.toThrow();
	});

	it('should error out if no application context is provided and execution is outside of an application context', () => {
		// exec / check
		expect(() => addPlugins([definePlugin(
			pluginId('emptyPlugin'),
			// oxlint-disable-next-line no-empty-function
			noop)
		]))
			.toThrow(new TypeError('addPlugin called outside of an application context and no app instance passed as parameter.'))
	});

	it('should add the plugin to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		// exec
		addPlugins([definePlugin(id, noop)], app);

		// check
		expect(app[pluginSymbol].has(id)).toBeTruthy();
	});

	it('should build the plugin', ({task, autoDestroy}) => {
		//setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const setup = vi.fn();

		// exec
		addPlugins([definePlugin(pluginId(task.id), setup)], app);

		// check
		expect(setup).toHaveBeenCalledOnce();
		expect(setup).toHaveBeenCalledWith(); // setup takes no arguments
	});

	it('should invoke the beforeCreate hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const spy = vi.fn();

		// exec
		addPlugins([definePlugin(pluginId(task.id), () => {
			onBeforeCreate(spy);
		})], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	});

	it('should invoke the beforeCreate hook before adding the plugin to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(id)).toBeFalsy();
		});

		// exec
		addPlugins([definePlugin(id, () => {
			onBeforeCreate(spy);
		})], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	});

	it('should invoke the created hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const spy = vi.fn();

		// exec
		addPlugins([definePlugin(pluginId(task.id), () => {
			onCreated(spy);
		})], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	})

	it('should invoke the created hook after adding the plugin to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(id)).toBeTruthy();
		});

		// exec
		addPlugins([definePlugin(id, () => {
			onCreated(spy);
		})], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	});

	it('should invoke the beforePluginRegistration hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const spy = vi.fn();

		app.emitter.on('beforePluginRegistration', spy)

		// exec
		const id = pluginId(task.id);
		const plugin = definePlugin(id, noop);
		addPlugins([plugin], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith({app, plugin: app[pluginSymbol].get(id)});
	});

	it('should invoke the beforePluginRegistration hook before the plugin is added to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		// checks
		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(id)).toBeFalsy();
		});

		app.emitter.on('beforePluginRegistration', spy);

		// exec
		addPlugins([definePlugin(id, noop)], app);
	});

	it('should invoke the beforePluginRegistration hook before the beforeCreate hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		const spy = vi.fn();

		app.emitter.on('beforePluginRegistration', () => spy('beforePluginRegistration'));

		// exec
		addPlugins([definePlugin(id, () => {
			onBeforeCreate(() => spy('beforeCreate'));
		})], app);

		// check
		// oxlint-disable no-magic-number
		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenNthCalledWith(1, 'beforePluginRegistration');
		expect(spy).toHaveBeenNthCalledWith(2, 'beforeCreate');
		// oxlint-enable
	});

	it('should invoke the pluginRegistered hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const spy = vi.fn();

		app.emitter.on('pluginRegistered', spy)

		// exec
		const id = pluginId(task.id);
		const plugin = definePlugin(id, noop);
		addPlugins([plugin], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith({app, plugin: app[pluginSymbol].get(id)});
	});

	it('should invoke the pluginRegistered hook after the plugin is added to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp([], {id: task.id}));
		const id = pluginId(task.id);

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(id)).toBeTruthy();
		});

		app.emitter.on('pluginRegistered', spy);

		// exec
		addPlugins([definePlugin(id, noop)], app);

		// check
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith({app, plugin: app[pluginSymbol].get(id)});
	});
});

describe('addPlugin', () => {
	// all of the above ?
});