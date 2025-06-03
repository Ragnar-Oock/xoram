import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { _PluginHooks, DefinedPlugin } from '../../../src';
import { createApp, definePlugin, destroyApp, onBeforeCreate, onBeforeDestroy, onCreated } from '../../../src';
import { pluginSymbol } from '../../../src/application/application.type';


describe('plugin', () => {
	describe('hooks', () => {
		// todo update / replace this test

		const pluginId = 'first';

		const hooks = {
			beforeCreate: vi.fn(),
			created: vi.fn(),
			beforeDestroy: vi.fn(),
		} as const satisfies Omit<{ [hook in keyof _PluginHooks]: Mock }, 'destroyed' | 'setup'>;

		const plugin = definePlugin(pluginId, () => {
			onBeforeCreate(() => hooks.beforeCreate());
			onCreated(() => hooks.created());
			onBeforeDestroy(() => hooks.beforeDestroy());
		});

		afterEach(() => {
			Object
				.values(hooks)
				.forEach(spy => spy.mockReset());
		});

		Object
			.entries(hooks)
			.forEach(([ hook, spy ]) => {
				it(`should invoke the "${ hook }" hook`, ({ task }) => {
					destroyApp(
						createApp([ plugin ], { id: task.id }),
					);

					expect(spy, `hook ${ hook } should have been called`).toHaveBeenCalledOnce();
					// todo test for app parameter
				});
			});

		// todo test for destroyed hook

		it(`should invoke the "destroyed" hook`, ({ task }) => {
			const app = createApp([ plugin ], { id: task.id });

			const spy = vi.fn();
			const pluginInstance = app[pluginSymbol].get(plugin.id);
			expect(pluginInstance).not.toBeUndefined();
			(pluginInstance as DefinedPlugin).hooks.on('destroyed', () => spy(plugin.id));

			destroyApp(app);

			expect(spy, `hook destroyed should have been called`).toHaveBeenCalledOnce();
			expect(spy, `hook destroyed should have been called with ${ String(plugin.id) }`).toHaveBeenCalledWith(plugin.id);
		});
	});
});