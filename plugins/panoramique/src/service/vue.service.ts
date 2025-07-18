import { defineService, onBeforeDestroy, type Service } from '@xoram/core';
import type { App } from 'vue';
import { createApp, h } from 'vue';
import PanoramiqueRoot from '../component/panoramique-root.vue';

/**
 * Create and expose a Vue app instance for panoramique to mount components into.
 *
 * @public
 */
export interface VueService extends Service {
	readonly app: App,
}

// todo : check how the unmount check impact bundle size
// todo : think of a way to pass custom app config
export const vueService = defineService<Record<string, never>, VueService>(() => {
	// prevent unmounting a vue app that is not currently mounted
	let mounted = false;

	const app = createApp({
		render: () => h(PanoramiqueRoot),
		mounted: () => {mounted = true;},
		beforeUnmount: () => {mounted = false;},
	});

	const service = { app } as const;

	onBeforeDestroy(() => {
		if (mounted) {
			service.app.unmount();
		}
	});

	return service;
});