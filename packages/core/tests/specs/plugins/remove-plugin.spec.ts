// eslint-disable no-magic-numbers
import { describe, expect, vi } from 'vitest';
import { type Application, type PluginId, removePlugin } from '../../../src';
import { getActiveApp, setActiveApp } from '../../../src/application/active-app';
import { pluginSymbol } from '../../../src/application/application.type';
import borisPlugin from '../../dummies/boris.plugin';
import personPlugin from '../../dummies/person.plugin';
import { it } from '../../fixture/test-with-destroyable';

describe('removePlugin', () => {
	type TestCase = [name: string, exec: (app: Application) => void];

	// run all tests in suite with both manually provided app context and auto-injected app context (as if used in a hook)
	describe.for<TestCase>([
		['with app context', (app): void => removePlugin(personPlugin.id, app)],
		['without app context', (app): void => {
			const reset = setActiveApp(app); // fake hook environment
			removePlugin(personPlugin.id)
			reset();
		}],
	])('%s', ([, exec]) => {
		it('should remove the plugin with given id from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec
			exec(app);
			// check
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
		});
		it('should recursively remove the plugins that depends on the targeted plugin from the app', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin, borisPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec
			exec(app);
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
			expect(() => {
				// @ts-expect-error intentionally unset app context to see if exec throws or not
				const reset = setActiveApp();

				// @ts-expect-error intentionally don't provide app context to see if it throws or not
				exec()
				reset();
			}).toThrow(); // todo add error message
		});
		it('should be idempotent', ({autoDestroyedApp}) => {
			// setup
			const app = autoDestroyedApp([personPlugin]);
			// validate
			expect(app[pluginSymbol].has(personPlugin.id)).toBeTruthy();
			// exec 1
			exec(app);
			// check 1
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
			// exec 2
			exec(app);
			// check 2
			expect(app[pluginSymbol].has(personPlugin.id)).toBeFalsy();
		});

		describe('beforePluginRemoved app hook', () => {
			it('should be invoked for all removed plugins', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('beforePluginRemoved', ({plugin}) => spy(plugin.id));

				exec(app);

				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenCalledWith(borisPlugin.id); // boris depends on person so should be invoked first
				expect(spy).toHaveBeenCalledWith(personPlugin.id);
			});
			it('should be invoked in reverse topological order of dependencies', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('beforePluginRemoved', ({plugin}) => spy(plugin.id));

				exec(app);

				expect(spy).toHaveBeenNthCalledWith(1, borisPlugin.id); // boris depends on person so should be invoked first
				expect(spy).toHaveBeenNthCalledWith(2, personPlugin.id);
			});
			it('should be invoked during the corresponding plugin\'s `teardown` phase', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('beforePluginRemoved', ({plugin}) => spy(plugin.phase));

				exec(app);

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

				exec(app);

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
			it('should be invoked with an active app', ({autoDestroyedApp}) => {
				// setup
				const app = autoDestroyedApp([personPlugin]);
				const spy = vi.fn();

				app.emitter.on('beforePluginRemoved', () => {
					spy(getActiveApp());
				})

				exec(app);

				expect(spy).toHaveBeenCalledExactlyOnceWith(app);
			});
		});

		describe('pluginRemoved app hook', () => {
			it('should be invoked for all removed plugins', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('pluginRemoved', ({plugin}) => spy(plugin.id));

				exec(app);

				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenCalledWith(borisPlugin.id); // boris depends on person so should be invoked first
				expect(spy).toHaveBeenCalledWith(personPlugin.id);
			});
			it('should be invoked in reverse topological order of dependencies', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('pluginRemoved', ({plugin}) => spy(plugin.id));

				exec(app);

				expect(spy).toHaveBeenNthCalledWith(1, borisPlugin.id); // boris depends on person so should be invoked first
				expect(spy).toHaveBeenNthCalledWith(2, personPlugin.id);
			});
			it('should be invoked during the corresponding plugin\'s `destroyed` phase', ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const spy = vi.fn();
				app.emitter.on('pluginRemoved', ({plugin}) => spy(plugin.phase));

				exec(app);

				expect(spy).toHaveBeenNthCalledWith(1, 'destroyed'); // boris
				expect(spy).toHaveBeenNthCalledWith(2, 'destroyed'); // person
			});
			it('should be invoked after the corresponding plugin\'s `destroyed` hook',  ({autoDestroyedApp}) => {
				const app = autoDestroyedApp([personPlugin, borisPlugin]);
				const calledBeforeDestroyOn = new Set<PluginId>();
				let calledBeforeDestroyed = true;

				app[pluginSymbol].forEach(plugin => plugin.hooks.on('destroyed', () => {
					calledBeforeDestroyOn.add(plugin.id);
				}))
				app.emitter.on('beforePluginRemoved', ({plugin}) => {
					calledBeforeDestroyed = calledBeforeDestroyed && (!calledBeforeDestroyOn.has(plugin.id))
				});

				exec(app);

				expect(calledBeforeDestroyed).toBeTruthy();
			});
			it('should be invoked safely', ({autoDestroyedApp}) => {
				// setup
				const app = autoDestroyedApp([personPlugin]);
				const spy = vi.fn();

				app.emitter.on('pluginRemoved', spy);
				app.emitter.on('pluginRemoved', () => {
					spy();
					throw new Error('catch me');
				})
				app.emitter.on('pluginRemoved', spy);

				expect(() => removePlugin(personPlugin.id, app)).not.toThrow();
				expect(spy).toHaveBeenCalledTimes(3);

			});
			it('should be invoked with an active app', ({autoDestroyedApp}) => {
				// setup
				const app = autoDestroyedApp([personPlugin]);
				const spy = vi.fn();

				app.emitter.on('pluginRemoved', () => {
					spy(getActiveApp());
				})

				exec(app);

				expect(spy).toHaveBeenCalledExactlyOnceWith(app);
			});
		})
	});
});