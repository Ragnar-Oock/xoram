import { addService, definePlugin } from '@zoram/core';
import { panoramique } from './services/panoramique.service';
import { vueService } from './services/vue.service';

export const panoramiquePlugin = definePlugin('panoramic', () => {
	addService('vue', vueService);
	addService('panoramique', panoramique);
});