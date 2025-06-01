import { defineService, type Service } from '@zoram/core';
import { type App, createApp } from 'vue';
import PanoramiqueRoot from '../component/panoramique-root.vue';

/**
 * Create and expose a Vue app instance using a {@link PanoramiqueRoot} as the root component.
 */
export interface VueService extends Service {
	app: App,
}

export const vueService = defineService<VueService>(() => ({
	app: createApp(PanoramiqueRoot),
}));