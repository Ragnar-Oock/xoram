import { defineService, type Service } from '@zoram/core';
import { type App, createApp } from 'vue';
import PanoramiquePlatform from '../components/PanoramiquePlatform.vue';


export interface VueService extends Service {
	app: App,
}

export const vueService = defineService<VueService>(() => {
	return {
		app: createApp(PanoramiquePlatform, { identifier: 'root' }),
	};
});