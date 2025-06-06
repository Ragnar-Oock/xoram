import {
	addPlugins,
	type Application,
	createApp,
	definePlugin,
	destroyApp,
	onBeforeDestroy,
	onCreated,
	removePlugin,
} from '@zoram/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { panoramiquePlugin, register } from '../../../src';
import ContextMenu from '../../component/ContextMenu.vue';

describe('register', () => {

	let app: Application;
	const componentId = 'child';

	beforeEach(({ task }) => {
		app = createApp([ panoramiquePlugin ], { id: task.name });
	});
	afterEach(() => {
		destroyApp(app);
	});

	describe('life cycle', () => {
		it('should register in service on created hook', () => {
			let existsBefore, existsAfter;

			addPlugins([
				definePlugin(() => {
					onCreated((app) => {
						existsBefore = app.services.panoramique._definitions[componentId] !== undefined;
					});
					register({
						id: componentId,
						type: ContextMenu,
					});
					onCreated((app) => {
						existsAfter = app.services.panoramique._definitions[componentId] !== undefined;
					});
				}),
			], app);

			expect(existsBefore).toBeFalsy();
			expect(existsAfter).toBeTruthy();
		});
		it('should unregister in service on beforeDestroyed hook', () => {
			let existsBefore, existsAfter;
			const pluginDefinition = definePlugin(() => {
				onBeforeDestroy((app) => {
					existsBefore = app.services.panoramique._definitions[componentId] !== undefined;
				});
				register({
					id: componentId,
					type: ContextMenu,
				});
				onBeforeDestroy((app) => {
					existsAfter = app.services.panoramique._definitions[componentId] !== undefined;
				});
			});
			addPlugins([
				pluginDefinition,
			], app);

			// exec
			removePlugin(pluginDefinition.id, app);

			expect(existsBefore).toBeTruthy();
			expect(existsAfter).toBeFalsy();
		});
	});
	describe('dependencies', () => {
		it('should mark the host plugin as dependent on panoramique', () => {
			const pluginDefinition = definePlugin(() => {
				register({
					id: componentId,
					type: ContextMenu,
				});
			});

			const plugin = pluginDefinition();

			expect(plugin.dependencies).toSatisfy(deps =>
				Array.isArray(deps)
				&& deps.includes(panoramiquePlugin.id),
			);
		});
	});
});