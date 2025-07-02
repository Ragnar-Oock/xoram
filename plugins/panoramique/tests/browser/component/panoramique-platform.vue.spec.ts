import { page } from '@vitest/browser/context';
import type { Application } from '@xoram/core';
import { addPlugins, createApp, definePlugin, destroyApp, onCreated } from '@xoram/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { addChild, defineComponentDefinition, panoramiquePlugin, register, rootHarness } from '../../../src';
import ContextMenu from '../../component/context-menu.vue';
import ContextOption from '../../component/context-option.vue';
import TestComponent from '../../component/test-component.vue';

describe('PanoramiquePlatform', () => {

	let app: Application;

	beforeEach(({ task }) => {
		app = createApp([ panoramiquePlugin ], { id: task.name });
	});
	afterEach(() => {
		destroyApp(app);
	});

	describe('mounted children order', () => {
		it(
			'should have the same DOM order for children as in slot of parent\'s harness',
			async ({ task }) => {
				// setup
				const childrenIds = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
				const menuId = 'menu_' + task.name;
				app.services.panoramique.register({
					id: menuId,
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

				app.services.panoramique.addChild(rootHarness, menuId);
				app.services.vue.app.mount(document.body); // mount the Vue app in the DOM

				// check
				for (let index = 0; index < childrenIds.length; index++) {
					const button = page.getByRole('menuitem').nth(index);

					await expect.element(button).toHaveTextContent(childrenIds[index]);
				}
			},
		);
		it('should not be impacted by registration order', async ({ task }) => {
			// setup
			const childrenIds = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
			const menuId = 'menu_' + task.name;

			app.services.panoramique.register({
				id: menuId,
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

			app.services.panoramique.addChild(rootHarness, menuId);
			app.services.vue.app.mount(document.body); // mount the Vue app in the DOM

			// check
			for (let index = 0; index < childrenIds.length; index++) {
				const button = page.getByRole('menuitem').nth(index);
				await expect.element(button).toHaveTextContent(childrenIds[index]);
			}
		});
		it('should not be impacted by addChild() call order when given an index', async ({ task }) => {
			// setup
			const childrenIds = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
			const menuId = 'menu_' + task.name;

			app.services.panoramique.register({
				id: menuId,
				type: ContextMenu,
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
				}))
				.forEach(
					// append the children at the start each time
					({ id }) => app.services.panoramique.addChild(menuId, id, 'default', 0),
				);

			app.services.panoramique.addChild(rootHarness, menuId);

			// exec
			app.services.vue.app.mount(document.body); // mount the Vue app in the DOM

			// check
			for (let index = 0; index < childrenIds.length; index++) {
				const button = page.getByRole('menuitem').nth(index);
				await expect.element(button).toHaveTextContent(childrenIds[index]);
			}
		});
	});

	describe('prop updates', () => {
		// Change props in the definition after registration → Vue component reacts accordingly.

		it('should update the component prop when updating the harness prop (direct value -> direct value)', async () => {
			const id = 'contextMenu';
			app.services.panoramique.register({
				id,
				type: ContextMenu,
				props: {
					open: true,
				},
			});
			app.services.panoramique.addChild(rootHarness, id);

			app.services.vue.app.mount(document.body);

			await expect.element(page.getByRole('menu'), { timeout: 100 }).toBeVisible();

			// test should fail if the value is nullish
			// eslint-disable-next-line no-non-null-assertion
			app.services.panoramique.get(id).value!.props.open = false;

			await expect.element(page.getByRole('menu'), { timeout: 100 }).not.toBeInTheDocument();
		});

		it('should update the component prop when changing the value of a ref bound to a prop (ref -> ref)', async () => {
			const id = 'contextMenu';
			const isOpen = ref(true);
			app.services.panoramique.register({
				id,
				type: ContextMenu,
				props: {
					open: isOpen,
				},
			});
			app.services.panoramique.addChild(rootHarness, id);

			app.services.vue.app.mount(document.body);

			// check both in case it simply isn't in the DOM
			await expect.element(page.getByRole('menu'), { timeout: 100 }).toBeVisible();


			isOpen.value = false;

			await expect.element(page.getByRole('menu'), { timeout: 100 }).not.toBeInTheDocument();
		});

		it(
			'should update the component prop when changing the value of a ref bound to a prop to a direct value (ref -> direct value)',
			async () => {
				const id = 'contextMenu';
				const isOpen = ref(true);
				app.services.panoramique.register({
					id,
					type: ContextMenu,
					props: {
						open: isOpen,
					},
				});
				app.services.panoramique.addChild(rootHarness, id);

				app.services.vue.app.mount(document.body);

				await expect.element(page.getByRole('menu'), { timeout: 100 }).toBeVisible();

				// test should fail if the value is nullish
				// eslint-disable-next-line no-non-null-assertion
				app.services.panoramique.get(id).value!.props.open = false;

				await expect.element(page.getByRole('menu'), { timeout: 100 }).not.toBeInTheDocument();
			},
		);
	});

	describe('model updates', () => {
		it('should propagate model updates to the definition when the component changes the value', async ({ task }) => {
			const isOpen = ref(true);
			addPlugins([
				definePlugin(() => {
					const id = 'opened-menu';

					register(defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', isOpen);
						bind('testid', task.id);
					}));
					addChild(rootHarness, id);

					onCreated(({ services }) => services.vue.app.mount(document.body));
				}),
			], app);

			await expect.element(page.getByRole('menu'), { timeout: 100 }).toBeVisible();

			document.body.click();

			// make sure the menu is closed
			await expect.element(page.getByRole('menu'), { timeout: 100 }).not.toBeInTheDocument();

			expect(isOpen.value).toBeFalsy();
		});

		it('should propagate model updates to the definition when another plugin changes the value', async ({ task }) => {
			const isOpen = ref(true);
			const id = 'opened-menu';

			addPlugins([
				definePlugin(() => {
					register(defineComponentDefinition(id, ContextMenu, ({ bind }) => {
						bind('open', isOpen);
						bind('testid', task.id);
					}));
					addChild(rootHarness, id);

					onCreated(({ services }) => services.vue.app.mount(document.body));
				}),
			], app);

			await expect.element(page.getByRole('menu'), { timeout: 100 }).toBeVisible();

			addPlugins([
				definePlugin(() => {

					onCreated(({ services }) => { services.panoramique.get(id).value!.props.open = false; });
				}),
			], app);

			// make sure the menu is closed
			await expect.element(page.getByRole('menu'), { timeout: 100 }).not.toBeInTheDocument();

			expect(isOpen.value).toBeFalsy();
		});

	});
	describe('event listener binding', () => {
		// all listener listed for an even are called
		// Removing harness cleans up listeners (no memory leaks / reactivity dead links).

		it('should call all the handlers when a component event is fired', async ({ task }) => {
			// setup
			const menuId = 'menu_' + task.name;

			app.services.panoramique.register({
				id: menuId,
				type: ContextMenu,
				props: {
					open: true,
				},
				children: [ 'option' ],
			});
			const spy = vi.fn();
			app.services.panoramique.register({
				id: 'option',
				type: ContextOption,
				props: {
					text: 'option',
				},
				events: {
					click: [ spy, spy ],
				},
			});
			app.services.panoramique.addChild(rootHarness, menuId);

			app.services.vue.app.mount(document.body);

			// validate setup
			await expect.element(page.getByRole('menuitem')).toBeVisible();

			// exec
			await page.getByRole('menuitem').click();

			// check
			expect(spy).toHaveBeenCalledTimes(2);
		});
		it('should call the handler when a native event is fired on the component root', async ({ task }) => {
			const spy = vi.fn();
			// setup
			const menuId = 'menu_' + task.name;

			app.services.panoramique.register({
				id: menuId,
				type: ContextMenu,
				props: {
					open: true,
					testid: task.id,
				},
				events: {
					click: [ spy, spy ],
				},
			});
			app.services.panoramique.addChild(rootHarness, menuId);

			app.services.vue.app.mount(document.body);

			// validate setup
			await expect.element(page.getByTestId(task.id)).toBeVisible();

			// exec
			// eslint-disable-next-line no-non-null-assertion
			(page.getByTestId(task.id).query() as HTMLElement | null)!.click();

			// check
			expect(spy).toHaveBeenCalledTimes(2);

		});
	});
	describe('mounting of component tree', () => {
		// Register root + nested children → Assert app renders full tree in correct slot structure.
		// Events declared in ComponentDefinition are properly bound and trigger callbacks.
		it('should mount components descending from root', async () => {
			// setup
			const depth = 15;

			for (let index = 0; index < depth; index++) {
				app.services.panoramique.register({
					id: `level${ index.toString(10) }`,
					type: TestComponent,
					props: {
						label: `level${ index.toString(10) }`,
					},
					children: {
						'stuff': [ `level${ (index + 1).toString(10) }` ],
					},
				});
			}
			app.services.panoramique.addChild(rootHarness, 'level0');

			app.services.vue.app.mount(document.body);

			for (let index = 0; index < depth; index++) {
				await expect.element(page.getByLabelText(`level${ (index).toString(10) }`, { exact: true }), { timeout: 100 })
					.toBeVisible();
			}
		});
		it('should not mount components not descending from root', async () => {
			// setup
			app.services.panoramique.register({
				id: 'present',
				type: ContextMenu,
				props: {
					open: true,
					testid: 'present',
				},
			});
			app.services.panoramique.register({
				id: 'absent',
				type: ContextMenu,
				props: {
					open: true,
					testid: 'absent',
				},
			});

			// only add 'present' to the root
			app.services.panoramique.addChild(rootHarness, 'present');

			app.services.vue.app.mount(document.body);

			await expect.element(page.getByTestId('absent')).not.toBeInTheDocument();
			await expect.element(page.getByTestId('present')).toBeInTheDocument();
		});
	});

	describe('hot remount', () => {
		// Dynamically remove and re-add children while app is running → View updates correctly without crash or stale
		// refs

		it('should dynamically mount new children', async ({ task }) => {
			const menuId = 'menu_' + task.name;

			app.services.panoramique.register({
				id: menuId,
				type: ContextMenu,
				props: {
					open: true,
				},
			});
			app.services.panoramique.register({
				id: 'option',
				type: ContextOption,
				props: {
					text: 'option',
				},
			});

			// only add the menu
			app.services.panoramique.addChild(rootHarness, menuId);

			app.services.vue.app.mount(document.body);

			// validate setup
			await expect.element(page.getByRole('menu')).toBeInTheDocument();
			await expect.element(page.getByRole('menuitem')).not.toBeInTheDocument();

			// execute
			app.services.panoramique.addChild(menuId, 'option');

			// check
			await expect.element(page.getByRole('menu')).toBeInTheDocument();
			await expect.element(page.getByRole('menuitem')).toBeInTheDocument();
		});
		it('should dynamically unmount removed children', async ({ task }) => {
			const menuId = 'menu_' + task.name;
			app.services.panoramique.register({
				id: menuId,
				type: ContextMenu,
				props: {
					open: true,
				},
				children: [ 'option' ],
			});
			app.services.panoramique.register({
				id: 'option',
				type: ContextOption,
				props: {
					text: 'option',
				},
			});

			app.services.panoramique.addChild(rootHarness, menuId);

			app.services.vue.app.mount(document.body);

			// validate setup
			await expect.element(page.getByRole('menu')).toBeInTheDocument();
			await expect.element(page.getByRole('menuitem')).toBeInTheDocument();

			// execute
			app.services.panoramique.removeChild(menuId, 'option');

			// check
			await expect.element(page.getByRole('menu')).toBeInTheDocument();
			await expect.element(page.getByRole('menuitem')).not.toBeInTheDocument();
		});
	});
	describe('edge cases', () => {
		// Register with invalid types throws validation errors or fails silently (depending on intended contract).
		it('should fail to mount when the component is invalid', async ({ task }) => {
			// todo make error message more informative

			const menuId = 'menu_' + task.name;
			app.services.panoramique.register({
				id: menuId,
				type: {},
			});
			app.services.panoramique.register({
				id: 'control',
				type: ContextOption,
				props: {
					text: 'bob',
					testid: 'control',
				},
			});

			app.services.panoramique.addChild(rootHarness, menuId);
			app.services.panoramique.addChild(rootHarness, 'control');
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0);

			app.services.vue.app.mount(document.body);

			// wait for control element to be visible
			await expect.element(page.getByTestId('control')).toBeVisible();

			expect(warnSpy).toHaveBeenCalledOnce();
		});

		// circular dep can be useful but should be used with caution so we won't prevent it (and it would be complex
		// and flaky to do so anyway)
		it('should fail to mount with static circular dependency', async () => {
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
		});
	});
});