import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { DefinedPlugin } from '../../../src';
import { definePlugin } from '../../../src';
import { getActivePlugin } from '../../../src/plugins/active-plugin';
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
		it('should accept a string and a function with no argument', ({ task }) => {
			expectTypeOf(definePlugin).toEqualTypeOf<(id: string, setup: () => void) => (() => DefinedPlugin)>();
			expect(() => definePlugin(task.id, noop)).not.toThrow();
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
		it('should return a callable object with a symbol as id', () => {
			const defined = definePlugin(noop);

			expect(defined.id).toBeTypeOf('symbol');
		});
		it('should use the provided id in as the label of the symbol used for id', ({ task }) => {
			const defined = definePlugin(task.id, noop);

			expect(defined.id.description).toBe(task.id);
		});
	});
	describe('invalid overloads', () => {
		it('should fail with just an id', ({ task }) => {
			expectTypeOf(definePlugin).not.toEqualTypeOf<(id: symbol) => (() => DefinedPlugin)>();
			// @ts-expect-error definePlugin can't take just an id as parameter
			expect(() => definePlugin(task.id)).toThrow(new TypeError('invalid definePlugin overload usage'));
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
			const setup = vi.fn();
			const definition = definePlugin(setup);

			definition();

			expect(setup).toHaveBeenCalledExactlyOnceWith(); // setup takes no argument
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
		it('should return a plugin object', ({ task }) => {
			const definition = definePlugin(task.id, noop);

			const plugin = definition();

			expect(plugin).toBeTypeOf('object');
		});
		it('should set the phase to `setup`', ({ task }) => {
			const definition = definePlugin(task.id, noop);

			const plugin = definition();

			expect(plugin.phase).toBe('setup');
		});
		it('should invoke the setup function when called', ({ task }) => {
			const setup = vi.fn();
			const definition = definePlugin(task.id, setup);

			definition();

			expect(setup).toHaveBeenCalledExactlyOnceWith(); // setup takes no argument
		});
		it('should catch errors from the setup function', ({ task }) => {
			const definition = definePlugin(task.id, () => {
				throw new Error('catch me');
			});

			expect(() => definition()).not.toThrow();
		});
		it('should provide the plugin object via activePlugin', ({ task }) => {
			let activePlugin;
			const definition = definePlugin(task.id, () => {
				activePlugin = getActivePlugin();
			});

			const plugin = definition();

			expect(activePlugin).toBe(plugin);
		});
	});
});