import { addService, type Application, createApp, definePlugin, destroyApp } from '@zoram/core';
import { getActivePinia } from 'pinia';
import { describe, expect } from 'vitest';
import { panoramique } from '../../src/service/panoramique.service';
import { vueService } from '../../src/service/vue.service';
import { it } from '../fixture/test.fixture';


describe('panoramique service', () => {
	describe('instancing', () => {
		it('should register a store in the active pinia instance', () => {
			const app = createApp([
				definePlugin(() => {
					addService('vue', vueService); // both services are coupled and can't work without one another
					addService('panoramique', panoramique);
				}),
			]);

			expect(getActivePinia()?.state?.value.panoramique).not.toBe(undefined);
			destroyApp(app);
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
			it.todo('should register the definition under the given id in the pinia store', () => {});
			it.todo('should initialize the definition into a proper harness', () => {});
			it.todo('should warn and abort when registering on an already used id', () => {});
			it.todo('should allow registration multiple definitions without collisions', () => {});
			it.todo('should allow registration of definitions pointing to not yet registered children', () => {});
		});
		describe('remove()', () => {
			it.todo('should remove the harness at the given id from the store', () => {});
			it.todo('should noop when the id is unknown', () => {});
		});
		describe('get()', () => {
			it.todo('should return a readonly computed', () => {});
			it.todo('should return a computed holding undefined when no harness exist at the id', () => {});
			it.todo('should return a computed holding the harness with that id when it exists', () => {});
		});
		describe('addChild()', () => {
			it.todo('should add the child id to the parent\'s default slot when no slot name is provided', () => {});
			it.todo('should add the child id to the parent\'s given slot name when provided', () => {});
			it.todo(
				'should insert at the correct index when given a positive integer smaller than the current number of children',
				() => {},
			);
			it.todo(
				'should insert at the end when given a positive integer greater or equal to the current number of children',
				() => {},
			);
			it.todo(
				'should insert at the given position from the end when given a negative integer smaller than the current number of children',
				() => {},
			);
			it.todo(
				'should insert at the start when given a negative integer greater or equal to the current number of children',
				() => {},
			);
			it.todo('should add the same child multiple times if called with the same arguments', () => {});
			it.todo('should warn and abort when a child is registered before its parent', () => {});
		});
		describe('removeChild()', () => {
			it.todo('should remove the child from its parent default slot when no slot name is provided', () => {});
			it.todo('should remove the child from its parent named slot when a slot name is provided', () => {});
			it.todo('should noop when attempting to remove a child from a slot is not registered into', () => {});
			it.todo('should noop when attempting to remove a child from a non existing parent', () => {});
		});
	});

	describe('integrations', () => {
		describe('get() returns a dynamically updated computed', () => {
			it.todo('should update from undefined to the harness when register() is called with that id', () => {});
			it.todo('should update from the harness to undefined when remove() is called with that id', () => {});
		});
		describe('Child Management Lifecycle', () => {
			it.todo('should not unregister a child when unlinking it from its parent', () => {
				// Register parent and child → Add child → Remove child → Ensure child is removed from parent but still present
				// in store.
			});
			it.todo('should not unregister children when unregistering parent', () => {
				// Add child to slot → Remove harness → get for parent returns undefined, child remains retrievable.
			});
		});

		describe('multiple slot component are respected', () => {
			it.todo('should allow mixed default and named slot registration', () => {});
			it.todo('should allow named only slot registration', () => {});
			it.todo('should allow multiple children per slot', () => {});
		});

		describe('children order', () => {
			it.todo('should have the same DOM order for children as in slot of parent\'s harness', () => {});
			it.todo('should not be impacted by registration order', () => {});
			it.todo('should not be impacted by addChild() call order when given an index', () => {});
		});

		// move that in another file ?
		describe('e2e', () => {
			describe('mounting of component tree', () => {
				// Register root + nested children → Assert app renders full tree in correct slot structure.
				// Events declared in ComponentHarness are properly bound and trigger callbacks.
			});
			describe('prop updates', () => {
				// Change props in the definition after registration → Vue component reacts accordingly.
				// Props support primitives, objects, and complex nested values.
			});
			describe('event listener binding', () => {
				// all listener listed for an even are called
				// Removing harness cleans up listeners (no memory leaks / reactivity dead links).
			});

			describe('hot remount', () => {
				// Dynamically remove and re-add children while app is running → View updates correctly without crash or stale
				// refs
			});
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
});

