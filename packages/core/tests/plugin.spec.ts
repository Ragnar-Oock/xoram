import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { createApp, definePlugin, onBeforeCreate, onBeforeDestroy, onCreated, PluginHooks, pluginSymbol } from '../src';


describe('plugin', () => {
	describe('hooks', () => {
		// todo update / replace this test

		const pluginId = Symbol('first');

		const hooks = {
			beforeCreate: vi.fn(),
			created: vi.fn(),
			beforeDestroy: vi.fn()
		} as const satisfies Omit<{ [hook in keyof PluginHooks]: Mock }, 'destroyed'>;

		const plugin = definePlugin(pluginId, () => {
			onBeforeCreate(() => hooks.beforeCreate(pluginId));
			onCreated(() => hooks.created(pluginId));
			onBeforeDestroy(() => hooks.beforeDestroy(pluginId));
		});

		afterEach(() => {
			Object
				.values(hooks)
				.forEach(spy => spy.mockReset());
		})

		Object
			.entries(hooks)
			.forEach(([hook, spy]) => {
				it(`should invoke the "${hook}" hook`, ({task}) => {
					createApp({id: task.id, plugins: [ plugin, ]})
						.destroy()

					expect(spy, `hook ${hook} should have been called`).toHaveBeenCalledOnce();
					expect(spy, `hook ${hook} should have been called with ${String(pluginId)}`).toHaveBeenCalledWith(pluginId);
				});
			})

		// todo test for destroyed hook

		it(`should invoke the "destroyed" hook`, ({task}) => {
			const app = createApp({id: task.id, plugins: [
					plugin,
				]})

			const spy = vi.fn();
			const pluginInstance = app[pluginSymbol].get(pluginId);
			expect(pluginInstance).not.toBeUndefined();
			pluginInstance.hooks.on('destroyed', () => spy(pluginId));

			app.destroy();

			expect(spy, `hook destroyed should have been called`).toHaveBeenCalledOnce();
			expect(spy, `hook destroyed should have been called with ${String(pluginId)}`).toHaveBeenCalledWith(pluginId);
		});
	});
});