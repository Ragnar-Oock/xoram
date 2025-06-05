import { defineService, onBeforeDestroy, type Service } from '@zoram/core';
import type { App } from 'vue';
import { createApp, h } from 'vue';
import PanoramiqueRoot from '../component/panoramique-root.vue';

/**
 * Create and expose a Vue app instance using a {@link PanoramiqueRoot} as the root component.
 */
export interface VueService extends Service {
	app: App,
}

// todo : check how the unmount check impact bundle size
export const vueService = defineService<VueService>(() => {
	// prevent unmounting a vue app that is not currently mounted
	let mounted = false;

	const app = createApp({
		render: () => h(PanoramiqueRoot),
		mounted: () => {mounted = true;},
		beforeUnmount: () => {mounted = false;},
	});

	const service: Omit<VueService, keyof Service> = { app };

	onBeforeDestroy(() => {
		if (mounted) {
			service.app.unmount();
		}
	});

	return service;
});