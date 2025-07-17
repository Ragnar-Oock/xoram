import { page } from '@vitest/browser/context';
import { addPlugins, createApp, definePlugin, destroyApp, onCreated } from '@xoram/core';
import { describe, expect, it } from 'vitest';
import { panoramiquePlugin, rootHarness } from '../../../src';
import ContextMenu from '../../component/context-menu.vue';

describe('edge case', () => {
	// circular dep can be useful but should be used with caution so we won't prevent it (and it would be complex
	// and flaky to do so anyway)
	it('should fail to mount with static circular dependency', async ({ task }) => {
		const app = createApp([ panoramiquePlugin ], { id: task.name });

		// todo make error message more informative
		addPlugins([
			definePlugin(() => {
				onCreated(app => {
					app.services.panoramique.register({
						id: 'cycle1',
						type: ContextMenu,
						props: {
							open: true,
						},
						children: [ 'cycle2' ],
					});
					app.services.panoramique.register({
						id: 'cycle2',
						type: ContextMenu,
						props: {
							open: true,
						},
						children: [ 'cycle1' ],
					});

					app.services.panoramique.addChild(rootHarness, 'cycle1');
				});
			}),
		], app);

		// the thrown error is not consistent across browsers:
		// chromium => RangeError: Maximum call stack size exceeded.
		// webkit => RangeError: Maximum call stack size exceeded
		// firefox => InternalError: too much recursion
		expect(() => app.services.vue.app.mount(document.body)).toThrow();

		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

		destroyApp(app);
	});

	// do not add any other tests bellow, the above test pollutes the global context with a broken Vue application
});