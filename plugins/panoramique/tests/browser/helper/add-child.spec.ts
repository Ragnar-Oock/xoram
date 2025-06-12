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
import { addChild, panoramiquePlugin, rootHarness } from '../../../src';

describe('addChild', () => {

	let app: Application;
	const componentId = 'child';

	beforeEach(({ task }) => {
		app = createApp([ panoramiquePlugin ], { id: task.name });
	});
	afterEach(() => {
		destroyApp(app);
	});

	describe('life cycle', () => {
		it('should add child in service on created hook', () => {
			let hasChildBefore, hasChildAfter;

			addPlugins([
				definePlugin(() => {
					onCreated((app) => {
						hasChildBefore = app.services.panoramique._harnesses[rootHarness].children.default?.includes(componentId);
					});
					addChild(rootHarness, componentId);
					onCreated((app) => {
						hasChildAfter = app.services.panoramique._harnesses[rootHarness].children.default?.includes(componentId);
					});
				}),
			], app);

			expect(hasChildBefore).toBeFalsy();
			expect(hasChildAfter).toBeTruthy();
		});
		it('should remove child in service on beforeDestroyed hook', () => {
			let hasChildBefore, hasChildAfter;
			const pluginDefinition = definePlugin(() => {
				onBeforeDestroy((app) => {
					hasChildBefore = app.services.panoramique._harnesses[rootHarness].children.default?.includes(componentId);
				});
				addChild(rootHarness, componentId);
				onBeforeDestroy((app) => {
					hasChildAfter = app.services.panoramique._harnesses[rootHarness].children.default?.includes(componentId);
				});
			});
			addPlugins([
				pluginDefinition,
			], app);

			// exec
			removePlugin(pluginDefinition.id, app);

			expect(hasChildBefore).toBeTruthy();
			expect(hasChildAfter).toBeFalsy();
		});
	});
	describe('dependencies', () => {
		it('should mark the host plugin as dependent on panoramique', () => {
			const pluginDefinition = definePlugin(() => {
				addChild(rootHarness, componentId);
			});

			const plugin = pluginDefinition();

			expect(plugin.dependencies).toSatisfy(deps =>
				Array.isArray(deps)
				&& deps.includes(panoramiquePlugin.id),
			);
		});
	});
});