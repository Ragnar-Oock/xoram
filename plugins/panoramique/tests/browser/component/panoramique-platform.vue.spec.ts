import { page } from '@vitest/browser/context';
import type { Application } from '@zoram/core';
import { createApp, destroyApp } from '@zoram/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { panoramiquePlugin } from '../../../src';
import ContextMenu from '../../component/ContextMenu.vue';
import ContextOption from '../../component/ContextOption.vue';

describe('PanoramiquePlatform', () => {

	let app: Application;

	beforeEach(() => {
		app = createApp([ panoramiquePlugin ]);
	});
	afterEach(() => {
		destroyApp(app);
	});
	// move that to PanoramiquePlatform.vue.spec.ts
	describe('mounted children order', () => {
		it('should have the same DOM order for children as in slot of parent\'s harness', async () => {
			// setup
			const childrenIds = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
			app.services.panoramique.register({
				id: 'menu',
				type: ContextMenu,
				children: Array.from(childrenIds),
				props: {
					open: true,
				},
			});

			childrenIds.map(id => app.services.panoramique.register({
				id,
				type: ContextOption,
				props: {
					text: id,
				},
			}));

			app.services.panoramique.addChild('root', 'menu');
			app.services.vue.app.mount(document.body); // mount the Vue app in the DOM

			// check
			for (let index = 0; index < childrenIds.length; index++) {
				const button = page.getByRole('menuitem').nth(index);

				await expect.element(button).toHaveTextContent(childrenIds[index]);
			}
		});
		it('should not be impacted by registration order', async () => {
			// setup
			const childrenIds = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
			app.services.panoramique.register({
				id: 'menu',
				type: ContextMenu,
				children: Array.from(childrenIds),
				props: {
					open: true,
				},
			});

			// register children in reverse order of their usage
			childrenIds
				.toReversed()
				.map(id => app.services.panoramique.register({
					id,
					type: ContextOption,
					props: {
						text: id,
					},
				}));

			app.services.panoramique.addChild('root', 'menu');
			console.log(document.body);
			app.services.vue.app.mount(document.body); // mount the Vue app in the DOM

			// check
			for (let index = 0; index < childrenIds.length; index++) {
				const button = page.getByRole('menuitem').nth(index);
				await expect.element(button).toHaveTextContent(childrenIds[index]);
			}
		});
		it.todo('should not be impacted by addChild() call order when given an index', () => {});
	});

	describe('prop updates', () => {
		// Change props in the definition after registration → Vue component reacts accordingly.
		// Props support primitives, objects, and complex nested values.
	});
	describe('event listener binding', () => {
		// all listener listed for an even are called
		// Removing harness cleans up listeners (no memory leaks / reactivity dead links).
	});
	describe('mounting of component tree', () => {
		// Register root + nested children → Assert app renders full tree in correct slot structure.
		// Events declared in ComponentHarness are properly bound and trigger callbacks.
	});

	describe('hot remount', () => {
		// Dynamically remove and re-add children while app is running → View updates correctly without crash or stale
		// refs
	});
	describe('edge cases', () => {
		// Register with invalid types throws validation errors or fails silently (depending on intended contract).
		it.todo('should fail to mount when the component is invalid', () => {});
		it.todo('should fail to mount when the component is missing (broken import)', () => {});

		// circular dep can be useful but should be used with caution so we won't prevent it (and it would be complex
		// and flaky to do so anyway)
		it.todo('should fail to mount with static circular dependency', () => {});
	});
});