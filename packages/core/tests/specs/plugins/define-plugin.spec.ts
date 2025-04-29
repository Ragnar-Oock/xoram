import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { DefinedPlugin } from '../../../src';
import { definePlugin, getActivePlugin, pluginId } from '../../../src';
import { noop } from '../../dummies/noop';

describe('definePlugin', () => {
	describe('overload 1 (setup)', () => {
		it('should accept a function with no argument', () => {
			expectTypeOf(definePlugin).toEqualTypeOf<(setup: () => void) => (() => DefinedPlugin)>();
			expect(() => definePlugin(noop)).not.toThrow();
		});
		it('should not invoke the setup function', () => {
			// setup
			const spy = vi.fn();

			// exec
			definePlugin(spy);

			// check
			expect(spy).not.toHaveBeenCalled();
		});
		it('should return a callable object', () => {
			const defined = definePlugin(noop);

			expect(defined).toBeInstanceOf(Function);
		});
		it('should return a callable object with an id', () => {
			const defined = definePlugin(noop);

			expect(defined.id).toBeTypeOf('symbol');
		});
	});
	describe('overload 2 (id, setup)', () => {
		it('should accept a symbol and a function with no argument', () => {
			expectTypeOf(definePlugin).toEqualTypeOf<(id: symbol, setup: () => void) => (() => DefinedPlugin)>()
			expect(() => definePlugin(pluginId(), noop)).not.toThrow();
		});
		it('should not invoke the setup function', () => {
			// setup
			const spy = vi.fn();

			// exec
			definePlugin(pluginId(), spy);

			// check
			expect(spy).not.toHaveBeenCalled();
		});
		it('should return a callable object', () => {
			const defined = definePlugin(pluginId(), noop);

			expect(defined).toBeInstanceOf(Function);
		});
		it('should return a callable object with an id', () => {
			const defined = definePlugin(pluginId(), noop);

			expect(defined.id).toBeTypeOf('symbol');
		});
		it('should use the provided id in the return', () => {
			const id = pluginId();
			const defined = definePlugin(id, noop);

			expect(defined.id).toBe(id);
		});
	});
	describe('invalid overloads', () => {
		it('should fail with just an id', () => {
			expectTypeOf(definePlugin).not.toEqualTypeOf<(id: symbol) => (() => DefinedPlugin)>();
			// @ts-expect-error definePlugin can't take just an id as parameter
			expect(() => definePlugin(pluginId())).toThrow(new TypeError('invalid definePlugin overload usage'));
		});
		it('should fail with 2 setup function', () => {
			expectTypeOf(definePlugin).not.toEqualTypeOf<(setup1: () => void, setup: () => void) => (() => DefinedPlugin)>();
			// @ts-expect-error definePlugin can't take 2 functions as parameters
			expect(() => definePlugin(noop, noop)).toThrow(new TypeError('invalid definePlugin overload usage'));
		});
	});
});

describe('PluginDefinition', () => {
	describe('from overload 1 (setup)', () => {
		it('should return a plugin object', () => {
			const definition = definePlugin(noop);

			const plugin = definition();

			expect(plugin).toBeTypeOf('object');
		});
		it('should set the phase to `setup`', () => {
			const definition = definePlugin(noop);

			const plugin = definition();

			expect(plugin.phase).toBe('setup');
		});
		it('should invoke the setup function when called', () => {
			const setup = vi.fn()
			const definition = definePlugin(setup);

			definition();

			expect(setup).toHaveBeenCalledOnce();
			expect(setup).toHaveBeenCalledWith();
		});
		it('should catch errors from the setup function', () => {
			const definition = definePlugin(() => {
				throw new Error('catch me');
			});

			expect(() => definition()).not.toThrow();
		});
		it('should provide the plugin object via activePlugin', () => {
			let activePlugin;
			const definition = definePlugin(() => {
				activePlugin = getActivePlugin();
			});

			const plugin = definition();

			expect(activePlugin).toBe(plugin);
		});
	});
	describe('from overload 2 (id, setup)', () => {
		it('should return a plugin object', () => {
			const definition = definePlugin(pluginId(), noop);

			const plugin = definition();

			expect(plugin).toBeTypeOf('object');
		});
		it('should set the phase to `setup`', () => {
			const definition = definePlugin(pluginId(), noop);

			const plugin = definition();

			expect(plugin.phase).toBe('setup');
		});
		it('should invoke the setup function when called', () => {
			const setup = vi.fn()
			const definition = definePlugin(setup);

			definition();

			expect(setup).toHaveBeenCalledOnce();
			expect(setup).toHaveBeenCalledWith();
		});
		it('should catch errors from the setup function', () => {
			const definition = definePlugin(pluginId(), () => {
				throw new Error('catch me');
			});

			expect(() => definition()).not.toThrow();
		});
		it('should provide the plugin object via activePlugin', () => {
			let activePlugin;
			const definition = definePlugin(pluginId(), () => {
				activePlugin = getActivePlugin();
			});

			const plugin = definition();

			expect(activePlugin).toBe(plugin);
		});
	});
});