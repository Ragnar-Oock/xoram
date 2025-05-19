import { describe, expect, vi } from 'vitest';
import { createApp, defineService } from '../../../src';
import { it } from '../../fixture/test.fixture';


describe('defineService', () => {
	describe('topic', () => {
		it('should return a function', () => {
			expect(typeof defineService()).toBe('function');
		});
		it('should return a valid service factory', () => {
			const factory = defineService();
			const topic = factory();

			// minimal requirements for an emitter
			expect(typeof topic.emitter.on).toBe('function');
			expect(typeof topic.emitter.off).toBe('function');
		});

		it('should not invoke the setup function', () => {
			const spy = vi.fn();

			defineService(spy);

			expect(spy).not.toHaveBeenCalled();
		});
	});
	describe('stateful', () => {

		it('should return a function', () => {
			expect(
				typeof defineService(() => ({ prop: 'value' })),
			).toBe('function');
		});
		it('should return a valid service factory', () => {
			const factory = defineService(() => ({ prop: 'value' }));
			const app = createApp([]);
			const service = factory(app);

			// minimal requirements for an emitter
			expect(typeof service.emitter.on).toBe('function');
			expect(typeof service.emitter.off).toBe('function');

			// check that the stuff on the setup's return object carried over
			expect(service.prop).toBe('value');
		});
		it('should pass the app and emitter to the setup function', () => {
			const spy = vi.fn();
			const factory = defineService(spy);
			const app = createApp([]);
			const service = factory(app);

			expect(spy).toHaveBeenCalledWith(app, service.emitter);
		});

		it('should not invoke the setup function', () => {
			const spy = vi.fn();

			defineService(spy);

			expect(spy).not.toHaveBeenCalled();
		});
	});


});