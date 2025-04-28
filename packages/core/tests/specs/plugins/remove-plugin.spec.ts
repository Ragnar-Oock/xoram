import { describe, expect, vi } from 'vitest';
import { getActiveApp, type PluginId, pluginSymbol, removePlugin, setActiveApp } from '../../../src';
import borisPlugin from '../../dummies/boris.plugin';
import { noop } from '../../dummies/noop';
import personPlugin from '../../dummies/person.plugin';
import { it } from '../../fixture/test-with-destroyable';

describe('removePlugin', () => {
	describe('using auto injection of app context', () => {
		it('should remove the plugin with given id from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			const resetActiveApp = setActiveApp(app); // emulate hook auto-injection
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			expect(getActiveApp()).toBeTypeOf('object');
			// exec
			removePlugin(personPlugin.id);
			// check
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
			// clean up
			resetActiveApp();
		});
		it('should recursively remove the plugins that depends on the targeted plugin from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin, borisPlugin]);
			const resetActiveApp = setActiveApp(app); // emulate hook auto-injection
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			expect(getActiveApp()).toBeTypeOf('object');
			// exec
			removePlugin(personPlugin.id);
			// check
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
			expect(app[pluginSymbol].has(borisPlugin.id)).toBeFalsy();
			// clean up
			resetActiveApp();
		});
		// todo how to check that ? using hook invocation order ?
		it.todo('should remove the dependent plugins before the targeted one', () => {});
		it('should be idempotent', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			const resetActiveApp = setActiveApp(app); // emulate hook auto-injection
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			expect(getActiveApp()).toBeTypeOf('object');
			// exec 1
			removePlugin(personPlugin.id);
			// check 1
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();

			// exec 2
			removePlugin(personPlugin.id);
			// check 2
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();

			// clean up
			resetActiveApp();
		});
	});
	describe('using manual injection of app context', () => {
		it('should remove the plugin with given id from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec
			removePlugin(personPlugin.id, app);
			// check
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
		});
		it('should recursively remove the plugins that depends on the targeted plugin from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin, borisPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec
			removePlugin(personPlugin.id, app);
			// check
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
			expect(app[pluginSymbol].has(borisPlugin.id)).toBeFalsy();
		});
		it('should throw if no app context is found', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();

			// exec / check
			expect(() => removePlugin(personPlugin.id)).toThrow(); // todo add error message
		});
		// todo how to check that ? using hook invocation order ?
		it.todo('should remove the dependent plugins before the targeted one', () => {});
		it('should be idempotent', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec 1
			removePlugin(personPlugin.id, app);
			// check 1
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
			// exec 2
			removePlugin(personPlugin.id, app);
			// check 2
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
		});

		describe('beforePluginRemoved hook', () => {
			it('should be invoked for all removed plugins', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const called = new Set<PluginId>;
				app.emitter.on('beforePluginRemoved', ({plugin}) => called.add(plugin.id));

				removePlugin(personPlugin.id, app);

				expect(called.has(personPlugin.id)).toBeTruthy();
				expect(called.has(borisPlugin.id)).toBeTruthy();
			});
			it('should be invoked in reverse topological order of dependencies', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('beforePluginRemoved', ({plugin}) => {
					spy(plugin.id);
				});

				removePlugin(personPlugin.id, app);

				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenNthCalledWith(1, borisPlugin.id); // boris depends on person so should be invoked first
				expect(spy).toHaveBeenNthCalledWith(2, personPlugin.id);
			});
			it('should be invoked during the corresponding plugin\'s `teardown` phase', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('beforePluginRemoved', ({plugin}) => {
					spy(plugin.phase);
				});

				removePlugin(personPlugin.id, app);

				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenNthCalledWith(1, 'teardown'); // boris
				expect(spy).toHaveBeenNthCalledWith(2, 'teardown'); // person
			});
			it('should be invoked before the corresponding plugin\'s `beforeDestroy` hook', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const calledBeforeDestroyOn = new Set<PluginId>();
				let calledBeforeBeforeDestroy = true;

				app[pluginSymbol].forEach(plugin => plugin.hooks.on('beforeDestroy', () => {
					calledBeforeDestroyOn.add(plugin.id);
				}))
				app.emitter.on('beforePluginRemoved', ({plugin}) => {
					calledBeforeBeforeDestroy = calledBeforeBeforeDestroy && (!calledBeforeDestroyOn.has(plugin.id))
				});

				removePlugin(personPlugin.id, app);

				expect(calledBeforeBeforeDestroy).toBeTruthy();
			});
			it('should be invoked safely', ({autoDestroyedApp}) => {
				// setup
				const app = autoDestroyedApp([personPlugin]);
				const spy = vi.fn();

				app.emitter.on('beforePluginRemoved', spy);
				app.emitter.on('beforePluginRemoved', () => {
					spy();
					throw new Error('catch me');
				})
				app.emitter.on('beforePluginRemoved', spy);

				expect(() => removePlugin(personPlugin.id, app)).not.toThrow();
				expect(spy).toHaveBeenCalledTimes(3);

			});
		});
	});

	describe('beforePluginRemoved hook', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when destroying an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `teardown` phase', noop);
		it.todo('should be invoked before the corresponding plugin\'s `beforeDestroy` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});

	describe('pluginRemoved hook', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when destroying an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `destroyed` phase', noop);
		it.todo('should be invoked after the corresponding plugin\'s `destroyed` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});
});