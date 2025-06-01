import { addService, definePlugin } from '@zoram/core';
import { panoramique } from './service/panoramique.service';
import { vueService } from './service/vue.service';

export const panoramiquePlugin = definePlugin('panoramic', () => {
	addService('vue', vueService);
	addService('panoramique', panoramique);
});