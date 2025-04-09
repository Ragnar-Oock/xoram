import {afterEach, describe, expect, it, vi} from "vitest";
import {createApp, definePlugin, dependsOn, onCreated} from "../src";

describe('application', () => {
	const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

	afterEach(() => {
		consoleWarn.mockReset();
	})

	it('should instantiate with warning with not plugin', ({task}) => {
		createApp({id: task.id, plugins: []});

		expect(consoleWarn).toHaveBeenCalledWith(`Application "${task.id}" initialized without plugin, did you forget to provide them ?`)
	})

	it('should instantiate a valid application', ({task}) => {
		const application = createApp({id: task.id, plugins: []});

		expect(application).toHaveProperty('id', task.id);
		expect(application).toHaveProperty('services', {});
		expect(application).toHaveProperty('emitter'); // check for emitter interface ?
	});

	describe('plugin initialization order', () => {
		const dependency = Symbol('dependency');
		const dependent = Symbol('dependent');
		const dependentPlugin = definePlugin(dependent, () => {
			dependsOn(dependency);

			setupSpy(dependent);

			onCreated(()=> {
				onCreatedSpy(dependent);
			})
		});
		const dependencyPlugin = definePlugin(dependency, () => {
			setupSpy(dependency);

			onCreated(()=> {
				onCreatedSpy(dependency);
			});
		});
		const setupSpy = vi.fn();
		const onCreatedSpy = vi.fn();

		afterEach(() => {
			setupSpy.mockReset();
			onCreatedSpy.mockReset();
		})

		it('should setup plugins in the provided order (in order)', ({task}) => {
			createApp({id: task.id, plugins: [
				dependencyPlugin,
				dependentPlugin,
			]});

			expect(setupSpy).toHaveBeenCalledTimes(2);
			expect(setupSpy).toHaveBeenNthCalledWith(1, dependency);
			expect(setupSpy).toHaveBeenNthCalledWith(2, dependent);
		});

		it('should setup plugins in the provided order (out of order)', ({task}) => {
			createApp({id: task.id, plugins: [
				dependentPlugin,
				dependencyPlugin,
			]});

			expect(setupSpy).toHaveBeenCalledTimes(2);
			expect(setupSpy).toHaveBeenNthCalledWith(1, dependent);
			expect(setupSpy).toHaveBeenNthCalledWith(2, dependency);

		});

		it('should instantiate dependent plugins after their dependency (initially ordered)', ({task}) => {
			createApp({id: task.id, plugins: [
				dependencyPlugin,
				dependentPlugin,
			]});

			expect(onCreatedSpy).toHaveBeenCalledTimes(2);
			expect(onCreatedSpy).toHaveBeenNthCalledWith(1, dependency);
			expect(onCreatedSpy).toHaveBeenNthCalledWith(2, dependent);
		});

		it('should instantiate dependent plugins after their dependency (initially out of order)', ({task}) => {
			createApp({id: task.id, plugins: [
				dependentPlugin,
				dependencyPlugin,
			]});

			expect(onCreatedSpy).toHaveBeenCalledTimes(2);
			expect(onCreatedSpy).toHaveBeenNthCalledWith(1, dependency);
			expect(onCreatedSpy).toHaveBeenNthCalledWith(2, dependent);
		});
	})
});