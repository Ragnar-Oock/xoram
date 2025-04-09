import {afterEach, beforeEach, describe, expect, it, Mock, vi} from "vitest";
import {createApp, definePlugin, onBeforeCreate, onBeforeDestroy, onCreated, PluginHooks} from "../src";


describe('plugin', () => {
	describe('hooks', () => {
		const first = Symbol('first');
		const second = Symbol('second');

		const hooks = {
			beforeCreate: vi.fn(),
			created: vi.fn(),
			beforeDestroy: vi.fn(),
			destroyed: vi.fn(),
		} as const satisfies { [hook in keyof PluginHooks]: Mock };

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
	});
});