import { defineService, type Service } from '@zoram/core';
import { type App, createApp } from 'vue';
import PanoramiqueRoot from '../components/panoramique-root.vue';

export interface VueService extends Service {
	app: App,
}

export const vueService = defineService<VueService>(() => ({
	app: createApp(PanoramiqueRoot),
}));