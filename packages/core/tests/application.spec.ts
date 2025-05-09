import { afterEach, describe, expect, vi } from 'vitest';
import { createApp, definePlugin, dependsOn, onCreated } from '../src';
import personPlugin from './dummies/person.plugin';
import { it } from './fixture/test-with-destroyable';

describe('application', () => {
	const consoleWarn = vi.spyOn(console, 'warn');

	afterEach(() => {
		consoleWarn.mockReset();
	});

	it.todo('should instantiate with warning with not plugin', ({ task, autoDestroy }) => {
		autoDestroy(createApp([], { id: task.id }));

		expect(consoleWarn)
			.toHaveBeenCalledWith(`Application "${ task.id }" initialized without plugin, did you forget to provide them ?`);
	});

	it('should instantiate a valid application', ({ task, autoDestroy }) => {
		const application = autoDestroy(createApp([], { id: task.id }));

		expect(application).toHaveProperty('id', task.id);
		expect(application).toHaveProperty('services', {});
		expect(application).toHaveProperty('emitter'); // check for emitter interface ?
	});

	it.fails('should throw if multiple plugins have the same id', ({ task, autoDestroy }) => {

		expect(() => autoDestroy(createApp([ personPlugin, personPlugin ], { id: task.id })))
			.toThrowError(new Error(
				'Application creation failed',
				{ cause: new Error(`Plugin with id "${ String(personPlugin.id) }" registered multiple times`) },
			));
	});

	describe('plugin initialization order', () => {
		const dependentPlugin = definePlugin('dependent', () => {
			dependsOn(dependencyPlugin.id);

			setupSpy('dependent');

			onCreated(() => {
				onCreatedSpy('dependent');
			});
		});
		const dependencyPlugin = definePlugin('dependency', () => {
			setupSpy('dependency');

			onCreated(() => {
				onCreatedSpy('dependency');
			});
		});
		const setupSpy = vi.fn();
		const onCreatedSpy = vi.fn();

		afterEach(() => {
			setupSpy.mockReset();
			onCreatedSpy.mockReset();
		});

		it('should setup plugins in the provided order (in order)', ({ task, autoDestroy }) => {
			autoDestroy(
				createApp([
					dependencyPlugin,
					dependentPlugin,
				], { id: task.id }),
			);

			// oxlint-disable no-magic-numbers
			expect(setupSpy).toHaveBeenCalledTimes(2);
			expect(setupSpy).toHaveBeenNthCalledWith(1, 'dependency');
			expect(setupSpy).toHaveBeenNthCalledWith(2, 'dependent');
			// oxlint-enable no-magic-numbers
		});

		it('should setup plugins in the provided order (out of order)', ({ task, autoDestroy }) => {
			autoDestroy(
				createApp([
					dependentPlugin,
					dependencyPlugin,
				], { id: task.id }),
			);

			// oxlint-disable no-magic-numbers
			expect(setupSpy).toHaveBeenCalledTimes(2);
			expect(setupSpy).toHaveBeenNthCalledWith(1, 'dependent');
			expect(setupSpy).toHaveBeenNthCalledWith(2, 'dependency');
			// oxlint-enable no-magic-numbers

		});

		it('should instantiate dependent plugins after their dependency (initially ordered)', ({ task, autoDestroy }) => {
			autoDestroy(
				createApp([
					dependencyPlugin,
					dependentPlugin,
				], { id: task.id }),
			);

			// oxlint-disable no-magic-numbers
			expect(onCreatedSpy).toHaveBeenCalledTimes(2);
			expect(onCreatedSpy).toHaveBeenNthCalledWith(1, 'dependency');
			expect(onCreatedSpy).toHaveBeenNthCalledWith(2, 'dependent');
			// oxlint-enable no-magic-numbers
		});

		it(
			'should instantiate dependent plugins after their dependency (initially out of order)',
			({ task, autoDestroy }) => {
				autoDestroy(
					createApp([
						dependentPlugin,
						dependencyPlugin,
					], { id: task.id }),
				);

				// oxlint-disable no-magic-numbers
				expect(onCreatedSpy).toHaveBeenCalledTimes(2);
				expect(onCreatedSpy).toHaveBeenNthCalledWith(1, 'dependency');
				expect(onCreatedSpy).toHaveBeenNthCalledWith(2, 'dependent');
				// oxlint-enable no-magic-numbers
			},
		);
	});
});