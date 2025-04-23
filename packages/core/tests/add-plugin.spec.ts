import {describe, expect, vi} from "vitest";
import {ApplicationHooks, createApp, definePlugin, dependsOn, onBeforeCreate, onCreated, pluginSymbol} from "../src";
import {addPlugins} from "../src/plugins/add-plugin";
import {pluginId} from "../src/plugins/define-plugin";
import borisPlugin, {borisPluginId} from "./dummies/boris.plugin";
import personPlugin, {personPluginId} from "./dummies/person.plugin";
import {it} from './fixture/test-with-destroyable';

describe('addPlugins', () => {
	it('should add plugins without dependencies', ({task, autoDestroy}) => {
		const app = autoDestroy(createApp({
			id: task.id,
			plugins: [definePlugin(pluginId(), () => {
				onCreated(() => {
					addPlugins([personPlugin]);
				})
			})]
		}));

		expect(app[pluginSymbol].has(personPluginId)).toBe(true);
	});

	it('should add plugins that depend on instanced plugins', ({task, autoDestroy}) => {
		const app = autoDestroy(createApp({
			id: task.id,
			plugins: [personPlugin, definePlugin(pluginId(), () => {
				onCreated(() => {
					addPlugins([borisPlugin]);
				})
			})]
		}));

		expect(app[pluginSymbol].has(borisPluginId)).toBe(true);
	});

	it('should add plugins that depends on plugins of the same batch', ({task, autoDestroy}) => {
		const app = autoDestroy(createApp({
			id: task.id,
			plugins: [definePlugin(pluginId(), () => {
				onCreated(() => {
					addPlugins([borisPlugin, personPlugin]);
				})
			})]
		}));

		expect(app[pluginSymbol].has(personPluginId)).toBe(true);
		expect(app[pluginSymbol].has(borisPluginId)).toBe(true);
	});

	it('should add plugins that depends on a mixed set of instanced plugins and of the same batch', ({task, autoDestroy}) => {
		const mixedDependencyPlugin = pluginId();
		const app = autoDestroy(createApp({
			id: task.id,
			plugins: [personPlugin, definePlugin(pluginId(), () => {
				onCreated(() => {
					addPlugins([borisPlugin, definePlugin(mixedDependencyPlugin, () => {
						dependsOn(borisPluginId);
						dependsOn(personPluginId);
					})]);
				})
			})]
		}));

		expect(app[pluginSymbol].has(personPluginId)).toBe(true);
		expect(app[pluginSymbol].has(borisPluginId)).toBe(true);
		expect(app[pluginSymbol].has(mixedDependencyPlugin)).toBe(true);
	});

	it('should throw if plugins of the batch have a circular dependency between themselves', ({task, autoDestroy}) => {
		const idA = pluginId('a');
		const idB = pluginId('b');

		const pluginA = definePlugin(idA, () => {
			dependsOn(idB);
		});
		const pluginB = definePlugin(idB, () => {
			dependsOn(idA);
		})

		const app = autoDestroy(createApp({
			id: task.id,
			plugins: []
		}));

		const spyOnFailedPluginRegistration = vi.fn();

		app.emitter.on('failedPluginRegistration', spyOnFailedPluginRegistration);

		expect(() => addPlugins([pluginA, pluginB], app)).not.toThrow();
		expect(spyOnFailedPluginRegistration).toHaveBeenCalledOnce();
		expect(spyOnFailedPluginRegistration).toHaveBeenCalledWith({
			app,
			reason: new Error(`The plugin "${String(idA)}" declares a dependency that directly or indirectly depends on it.`)
		} satisfies ApplicationHooks['failedPluginRegistration']);
	});

	// todo should this throw, warn or play a hook ?
	it.todo('should throw if a plugin with same id already exist', ({task, autoDestroy}) => {
		const idA = pluginId('a');

		const pluginA = definePlugin(idA, () => {
			onCreated(() => console.log('created'));
		});
		const pluginB = definePlugin(idA, () => {
			onCreated(() => console.log('created'));
		})

		const app = autoDestroy(createApp({id: task.id, plugins: [ pluginA, ]}));

		expect(() => addPlugins([pluginB], app)).toThrow();
	});
	// we can't introduce dependency cycles in an app where all plugin dependencies are already met
	// that won't be true when we add optional dependencies, will that pause any issue ?

	// how to test that a function take an argument ?
	it.todo('should accept an application context', () => {});

	it('should error out if no application context is provided and execution is outside of an application context', () => {
		expect(() => addPlugins([definePlugin(
			pluginId('emptyPlugin'),
			// eslint-disable-next-line no-empty-function
			() => {})
		]))
			.toThrow(new TypeError('addPlugin called outside of an application context and no app instance passed as parameter.'))
	});

	it('should add the plugin to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp({id: task.id, plugins: []}));
		const id = pluginId(task.id);

		// exec
		addPlugins([definePlugin(id, () => {})], app);

		// validate
		expect(app[pluginSymbol].has(id)).toBeTruthy();
	});

	it('should build the plugin', ({task, autoDestroy}) => {
		//setup
		const app = autoDestroy(createApp({id: task.id, plugins: []}));
		const setup = vi.fn();

		// exec
		addPlugins([definePlugin(pluginId(task.id), setup)], app);

		// validate
		expect(setup).toHaveBeenCalledOnce();
		expect(setup).toHaveBeenCalledWith(); // setup takes no arguments
	});

	it('should invoke the beforeCreate hook', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp({id: task.id, plugins: []}));
		const spy = vi.fn();

		// exec
		addPlugins([definePlugin(pluginId(task.id), () => {
			onBeforeCreate(spy);
		})], app);

		// validate
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	});

	it('should invoke the beforeCreate hook before adding the plugin to the application', ({task, autoDestroy}) => {
		// setup
		const app = autoDestroy(createApp({id: task.id, plugins: []}));
		const id = pluginId(task.id);

		const spy = vi.fn(() => {
			expect(app[pluginSymbol].has(id)).toBeFalsy();
		});

		// exec
		addPlugins([definePlugin(id, () => {
			onBeforeCreate(spy);
		})], app);

		// validate
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(app);
	});

	it.todo('should invoke the created hook', () => {});

	it.todo('should invoke the created hook after adding the plugin to the application', () => {});

	it.todo('should invoke the beforePluginRegistration hook', () => {});

	// todo should beforePluginRegistration be invoked before or after beforeCreate ?
	it.todo('should invoke the beforePluginRegistration hook before the plugin is added to the application', () => {});

	it.todo('should invoke the pluginRegistered hook', () => {});

	// todo should pluginRegistered be invoked before or after beforeCreate ?
	it.todo('should invoke the pluginRegistered hook after the plugin is added to the application', () => {});
});

describe('addPlugin', () => {
	// all of the above ?
});