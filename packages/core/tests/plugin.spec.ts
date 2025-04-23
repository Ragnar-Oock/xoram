import {afterEach, describe, expect, it, Mock, vi} from "vitest";
import {createApp, definePlugin, onBeforeCreate, onBeforeDestroy, onCreated, PluginHooks, pluginSymbol} from "../src";


describe('plugin', () => {
	describe('hooks', () => {
		const first = Symbol('first');
		const second = Symbol('second');

		const hooks = {
			beforeCreate: vi.fn(),
			created: vi.fn(),
			beforeDestroy: vi.fn()
		} as const satisfies Omit<{ [hook in keyof PluginHooks]: Mock }, 'destroyed'>;

		const firstPlugin = definePlugin(first, () => {
			onBeforeCreate(() => hooks.beforeCreate(first));
			onCreated(() => hooks.created(first));
			onBeforeDestroy(() => hooks.beforeDestroy(first));
		});
		const secondPlugin = definePlugin(second, () => {
			onBeforeCreate(() => hooks.beforeCreate(second));
			onCreated(() => hooks.created(second));
			onBeforeDestroy(() => hooks.beforeDestroy(second));
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
					createApp({id: task.id, plugins: [
							firstPlugin,
						]})
						.destroy()

					expect(spy, `hook ${hook} should have been called`).toHaveBeenCalledOnce();
					expect(spy, `hook ${hook} should have been called with ${String(first)}`).toHaveBeenCalledWith(first);
				});
			})

		// todo test for destroyed hook

		it(`should invoke the "destroyed" hook`, ({task}) => {
			const app = createApp({id: task.id, plugins: [
					firstPlugin,
				]})

			const spy = vi.fn();
			app[pluginSymbol].get(first)!.hooks.on('destroyed', () => spy(first));

			app.destroy();

			expect(spy, `hook destroyed should have been called`).toHaveBeenCalledOnce();
			expect(spy, `hook destroyed should have been called with ${String(first)}`).toHaveBeenCalledWith(first);
		});
	});
});