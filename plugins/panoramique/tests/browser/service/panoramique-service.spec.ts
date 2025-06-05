import { addService, type Application, createApp, definePlugin, destroyApp } from '@zoram/core';
import { getActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { panoramiquePlugin } from '../../../src';
import type { ComponentDefinition } from '../../../src/service/component-definition.type';
import { panoramique } from '../../../src/service/panoramique.service';
import { vueService } from '../../../src/service/vue.service';
import ContextMenu from '../../component/ContextMenu.vue';
import ContextOption from '../../component/ContextOption.vue';
import { it } from '../../fixture/test.fixture';


declare module '../../../src/service/panoramique.service' {
	interface PanoramiqueService {
		_definitions: Record<string, ComponentDefinition>;
	}
}

describe('panoramique service', () => {
	let app: Application;

	function def(id: string): ComponentDefinition | undefined {
		return app.services.panoramique._definitions[id];
	}

	beforeEach(() => {
		app = createApp([ panoramiquePlugin ]);
	});
	afterEach(() => {
		destroyApp(app);
	});

	describe('instancing', () => {
		it('should register a store in the active pinia instance', () => {
			const application = createApp([
				definePlugin(() => {
					addService('vue', vueService); // both services are coupled and can't work without one another
					addService('panoramique', panoramique);
				}),
			]);

			expect(getActivePinia()?.state?.value.panoramique).not.toBe(undefined);
			destroyApp(application);
		});

		it('should allow for multiple application instances', () => {
			function createApplication(): Application {
				return createApp([
					definePlugin(() => {
						addService('vue', vueService); // both services are coupled and can't work without one another
						addService('panoramique', panoramique);
					}),
				]);
			}

			const app1 = createApplication();
			const app2 = createApplication();

			expect(app1.services.vue.app.config.globalProperties.$pinia)
				.not
				.toBe(app2.services.vue.app.config.globalProperties.$pinia);
		});
	});

	describe('properties', () => {
		describe('register()', () => {
			it('should register the definition under the given id in the pinia store', () => {
				const id = 'context-menu';
				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});

				expect(def(id)).toBeTypeOf('object');
				expect(def(id)?.id).toBe(id);
			});
			it('should initialize the definition into a proper harness', () => {

				const id = 'context-menu';
				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});

				const definition = def(id);
				expect(definition).toSatisfy(value => (
					value !== null
					&& typeof value === 'object'
					&& Object.entries({
						id: 'string',
						type: 'object', // vue component type ?
						props: 'object',
						events: 'object',
						children: 'object',
					}).every(([ key, type ]) => typeof value[key] === type)
				));
			});
			it('should warn and abort when registering on an already used id', () => {
				const id = 'context-menu';
				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});

				const consoleSpy = vi
					.spyOn(console, 'warn')
					// eslint-disable-next-line no-empty-function
					.mockImplementation(() => {});

				app.services.panoramique.register({
					id,
					type: ContextOption,
				});

				expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
					'🔭 A harness with the id context-menu is already registered in the store. Skipping...');
				expect(def(id)?.type).toBe(ContextMenu);
			});
			it('should allow registration multiple definitions without collisions', () => {
				const menu = 'context-menu';
				const option = 'context-option';
				app.services.panoramique.register({
					id: menu,
					type: ContextMenu,
				});

				app.services.panoramique.register({
					id: option,
					type: ContextOption,
				});

				expect(def(menu)?.type).toBe(ContextMenu);
				expect(def(option)?.type).toBe(ContextOption);
			});
			it('should allow registration of definitions pointing to not yet registered children', () => {
				const id = 'context-menu';

				app.services.panoramique.register({
					id,
					type: ContextMenu,
					children: [ 'context-option' ],
				});

				expect(def(id)).not.toBe(undefined);
			});

			describe('can pre-fill slots', () => {
				it('should allow mixed default and named slots', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: {
							default: [ 'child1' ],
							slotName: [ 'child2' ],
						},
					});

					expect(def('parent')?.children.default).toStrictEqual([ 'child1' ]);
					expect(def('parent')?.children.slotName).toStrictEqual([ 'child2' ]);
				});
				it('should allow named only slot', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: {
							slotName: [ 'child' ],
						},
					});

					expect(def('parent')?.children.slotName).toStrictEqual([ 'child' ]);
				});
				it('should allow explicit default slot only', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: {
							default: [ 'child' ],
						},
					});

					expect(def('parent')?.children.default).toStrictEqual([ 'child' ]);
				});
				it('should allow implicit default slot only', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child' ],
					});

					expect(def('parent')?.children.default).toStrictEqual([ 'child' ]);
				});
				it('should allow multiple children per named slot ', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: {
							slotName: [ 'child1', 'child2' ],
						},
					});

					expect(def('parent')?.children.slotName).toStrictEqual([ 'child1', 'child2' ]);
				});
				it('should allow multiple children for explicit default slot ', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: {
							default: [ 'child1', 'child2' ],
						},
					});

					expect(def('parent')?.children.default).toStrictEqual([ 'child1', 'child2' ]);
				});
				it('should allow multiple children for explicit default slot ', () => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child1', 'child2' ],
					});

					expect(def('parent')?.children.default).toStrictEqual([ 'child1', 'child2' ]);
				});
			});

			it('should fail when the component is missing (for example broken import)', () => {
				// todo make error message more informative
				expect(() => app.services.panoramique.register({
					id: 'menu',
					// @ts-expect-error "forgetting" to add the component
					type: undefined,
				})).toThrow();
			});
		});
		describe('remove()', () => {
			it('should remove the harness at the given id from the store', () => {
				const id = 'context-menu';

				app.services.panoramique.register({
					id,
					type: ContextMenu,
					children: [ 'context-option' ],
				});

				// validate setup
				expect(def(id)).not.toBe(undefined);

				app.services.panoramique.remove(id);

				expect(def(id)).toBe(undefined);
			});
			it('should noop when the id is unknown', () => {
				const unknownId = 'unknown';
				// validate setup
				expect(def(unknownId)).toBe(undefined);

				app.services.panoramique.remove(unknownId);

				expect(def(unknownId)).toBe(undefined);
			});
			it('should not unregister children when unregistering parent', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
					children: [ 'child' ],
				});
				app.services.panoramique.register({
					id: 'child',
					type: ContextOption,
				});

				// validate setup
				expect(def('child')).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(def('child')).not.toBe(null);

				app.services.panoramique.remove('parent');

				// check that child is still registered
				expect(def('child')).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(def('child')).not.toBe(null);
			});
		});
		describe('get()', () => {
			it('should return a readonly computed', () => {
				const id = 'menu';
				const harness = app.services.panoramique.get(id);

				// prevent Vue warn from showing in the console
				vi.spyOn(console, 'warn')
					// eslint-disable-next-line no-empty-function
					.mockImplementation(() => {});

				expect(harness).toBeTypeOf('object');
				expect(harness).toHaveProperty('value');
				const value = harness.value;

				// @ts-expect-error we are checking that the value is actually readonly
				// noinspection JSConstantReassignment
				harness.value = { id, type: ContextMenu };
				expect(harness.value).toBe(value);
			});
			it('should return a computed holding undefined when no harness exist at the id', () => {
				const id = 'menu';
				const harness = app.services.panoramique.get(id);

				expect(harness.value).toBe(undefined);
			});
			it('should return a computed holding the harness with that id when it exists', () => {
				const id = 'menu';
				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});

				// expect an initialized harness, not the definition we gave
				expect(app.services.panoramique.get(id).value).toEqual({
					id,
					type: ContextMenu,
					children: { default: [] },
					props: {},
					events: {},
				});
			});
		});
		describe('addChild()', () => {
			it('should add the child id to the parent\'s default slot when no slot name is provided', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
				});
				app.services.panoramique.register({
					id: 'child',
					type: ContextOption,
				});

				app.services.panoramique.addChild('parent', 'child');

				expect(def('parent')?.children.default[0]).toBe('child');
			});
			it('should add the child id to the parent\'s given slot name when provided', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
				});
				app.services.panoramique.register({
					id: 'child',
					type: ContextOption,
				});

				app.services.panoramique.addChild('parent', 'child', 'slotName');

				expect(def('parent')?.children.slotName[0]).toBe('child');
			});
			it('should allow adding an unregistered id to a parent (no slot)', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
				});

				app.services.panoramique.addChild('parent', 'child');

				expect(def('parent')?.children.default[0]).toBe('child');
			});
			it(
				'should insert at the correct index when given a positive integer smaller than the current number of children',
				() => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child1', 'child2' ],
					});
					app.services.panoramique.register({
						id: 'child1',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child2',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child3',
						type: ContextOption,
					});

					app.services.panoramique.addChild('parent', 'child3', 'default', 1);

					expect(def('parent')?.children.default.at(1)).toBe('child3');
				},
			);
			it(
				'should insert at the end when given a positive integer greater or equal to the current number of children',
				() => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child1', 'child2' ],
					});
					app.services.panoramique.register({
						id: 'child1',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child2',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child3',
						type: ContextOption,
					});

					app.services.panoramique.addChild('parent', 'child3', 'default', 15);

					expect(def('parent')?.children.default.at(-1)).toBe('child3');
				},
			);
			it(
				'should insert at the given position from the end when given a negative integer smaller than the current number of children',
				() => {
					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child1', 'child2' ],
					});
					app.services.panoramique.register({
						id: 'child1',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child2',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child3',
						type: ContextOption,
					});

					app.services.panoramique.addChild('parent', 'child3', 'default', -1);

					expect(def('parent')?.children.default.at(-1)).toBe('child3');
				},
			);
			it(
				'should insert at the start when given a negative integer greater or equal to the current number of children',
				() => {

					app.services.panoramique.register({
						id: 'parent',
						type: ContextMenu,
						children: [ 'child1', 'child2' ],
					});
					app.services.panoramique.register({
						id: 'child1',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child2',
						type: ContextOption,
					});
					app.services.panoramique.register({
						id: 'child3',
						type: ContextOption,
					});

					app.services.panoramique.addChild('parent', 'child3', 'default', Number.NEGATIVE_INFINITY);

					expect(def('parent')?.children.default.at(0)).toBe('child3');
				},
			);
			it('should add the same child multiple times if called with the same arguments', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
				});

				app.services.panoramique.addChild('parent', 'child');
				app.services.panoramique.addChild('parent', 'child');

				expect(def('parent')?.children.default).toStrictEqual([ 'child', 'child' ]);
			});
			it('should warn and abort when adding a child to an unregistered parent', () => {

				const consoleWarn = vi
					.spyOn(console, 'warn')
					// eslint-disable-next-line no-empty-function
					.mockImplementation(() => {});
				app.services.panoramique.addChild('parent', 'child');


				expect(consoleWarn).toHaveBeenCalledExactlyOnceWith(
					'🔭 Tried to assign a child (id: child) to a non-existing harness (id: parent). Skipping...');
			});
		});
		describe('removeChild()', () => {
			it('should remove the child from its parent default slot when no slot name is provided', () => {
				const parent = 'parent';
				const child = 'child';
				app.services.panoramique.register({
					id: parent,
					type: ContextMenu,
					children: [ child ],
				});

				expect(def(parent)?.children.default).toStrictEqual([ child ]);

				app.services.panoramique.removeChild(parent, child);
				expect(def(parent)?.children.default).toStrictEqual([]);
			});
			it('should remove the child from its parent named slot when a slot name is provided', () => {
				const parent = 'parent';
				const child = 'child';
				app.services.panoramique.register({
					id: parent,
					type: ContextMenu,
					children: {
						slotName: [ child ],
					},
				});

				expect(def(parent)?.children.slotName).toStrictEqual([ child ]);

				app.services.panoramique.removeChild(parent, child, 'slotName');
				expect(def(parent)?.children.slotName).toStrictEqual([]);
			});
			it('should noop when attempting to remove a child from a slot is not registered into', () => {
				const parent = 'parent';
				const otherChild = 'otherChild';
				app.services.panoramique.register({
					id: parent,
					type: ContextMenu,
					children: {
						default: [ otherChild ],
					},
				});

				expect(def(parent)?.children.default).toStrictEqual([ otherChild ]);

				app.services.panoramique.removeChild(parent, 'child');
				expect(def(parent)?.children.default).toStrictEqual([ otherChild ]);
			});
			it('should noop when attempting to remove a child from a non existing parent', () => {
				const parent = 'parent';

				expect(def(parent)).toBe(undefined);

				app.services.panoramique.removeChild(parent, 'child');
				expect(def(parent)).toBe(undefined);
			});
			it('should not remove the harness from the store', () => {
				app.services.panoramique.register({
					id: 'parent',
					type: ContextMenu,
					children: [ 'child' ],
				});
				app.services.panoramique.register({
					id: 'child',
					type: ContextOption,
				});

				// validate setup
				expect(def('child')).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(def('child')).not.toBe(null);

				app.services.panoramique.removeChild('parent', 'child');

				// check that child is still registered
				expect(def('child')).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(def('child')).not.toBe(null);
			});
		});
	});

	describe('integrations', () => {
		describe('get() returns a dynamically updated computed', () => {
			it('should update from undefined to the harness when register() is called with that id', () => {
				const id = 'id';
				const harness = app.services.panoramique.get(id);
				expect(harness.value).toBe(undefined);

				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});

				expect(harness.value).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(harness.value).not.toBe(null);
				expect(harness.value).toStrictEqual({
					id,
					type: ContextMenu,
					props: {},
					events: {},
					children: {
						default: [],
					},
				});
			});
			it('should update from the harness to undefined when remove() is called with that id', () => {
				const id = 'id';
				app.services.panoramique.register({
					id,
					type: ContextMenu,
				});
				const harness = app.services.panoramique.get(id);

				// validate setup
				expect(harness.value).toBeTypeOf('object');
				// eslint-disable-next-line no-null
				expect(harness.value).not.toBe(null);

				app.services.panoramique.remove(id);

				expect(harness.value).toBe(undefined);
			});
		});
	});
});

