import { addService, definePlugin } from '@zoram/core';
import { panoramique } from './service/panoramique.service';
import { vueService } from './service/vue.service';

/**
 * Provide the panoramique and vue services to enable the use of Vue components to build dynamic UIs.
 */
export const panoramiquePlugin = definePlugin('panoramic', () => {
	addService('vue', vueService);
	addService('panoramique', panoramique);
});