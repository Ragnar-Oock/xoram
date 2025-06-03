import { describe, it } from 'vitest';
import { noop } from '../../dummies/noop';


/**
 * for each hook:
 * - check that it is invoked
 * - check that it is invoked during the correct phase
 * - check that it is invoked in the correct order
 * - check that it is invoked with context
 * - check that errors are handled
 */


describe('plugin hooks', () => {
	describe('setup', () => {
		it.todo('should be invoked when adding a plugin to an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the setup phase', noop);
		it.todo('should be invoked before any other plugin hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
		it.todo('should be invoked with an active plugin', noop);
	});

	describe('beforeCreate', () => {
		it.todo('should be invoked when adding a plugin to an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the `mount` phase');
		it.todo('should be invoked before the plugin is added to the app', noop);
		it.todo('should be invoked after the `setup` plugin hook', noop);
		it.todo('should be invoked after the `beforePluginRegistration` app hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
		it.todo('should be invoked with an active plugin', noop);
	});

	describe('created', () => {
		it.todo('should be invoked when adding a plugin to an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the `active` phase', noop);
		it.todo('should be invoked after the plugin is added to the app', noop);
		it.todo('should be invoked after the `beforeCreate` plugin hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
		it.todo('should be invoked with an active plugin', noop);
	});

	describe('beforeDestroy', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the `teardown` phase', noop);
		it.todo('should be invoked after the `beforePluginRemoved` app hook', noop);
		it.todo('should be invoked before thee plugin has been removed from the app', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
		it.todo('should be invoked with an active plugin', noop);
	});

	describe('destroyed', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the `destroyed` phase', noop);
		it.todo('should be invoked after the plugin has been removed from the app', noop);
		it.todo('should be invoked before the `beforePluginRemoved` app hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
		it.todo('should be invoked with an active plugin', noop);
	});
});

describe('application hooks', () => {
	describe('beforePluginRegistration', () => {
		it.todo('should be invoked when adding a plugin to an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `mount` phase', noop);
		it.todo('should be invoked before the corresponding plugin\'s `beforeCreate` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});

	describe('pluginRegistered', () => {
		it.todo('should be invoked when adding a plugin to an app', noop);
		it.todo('should be invoked when creating an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `active` phase', noop);
		it.todo('should be invoked after the corresponding plugin\'s `created` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});

	describe('beforePluginRemoved', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when destroying an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `teardown` phase', noop);
		it.todo('should be invoked before the corresponding plugin\'s `beforeDestroy` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});

	describe('pluginRemoved', () => {
		it.todo('should be invoked when removing a plugin from an app', noop);
		it.todo('should be invoked when destroying an app', noop);
		it.todo('should be invoked during the corresponding plugin\'s `destroyed` phase', noop);
		it.todo('should be invoked after the corresponding plugin\'s `destroyed` hook', noop);
		it.todo('should be invoked safely', noop);
		it.todo('should be invoked with an active app', noop);
	});

});