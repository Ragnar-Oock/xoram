import { addService, definePlugin } from '@zoram/core';
import { panoramique, type PanoramiqueService } from './services/panoramique.service';
import { type VueService, vueService } from './services/vue.service';


declare module '@zoram/core' {
	interface ServiceCollection {
		/**
		 * Expose the Vue App instance.
		 */
		vue: VueService;

		/**
		 * Register components and compose them to build your UI.
		 */
		panoramique: PanoramiqueService;
	}
}

export default definePlugin('panoramic', () => {
	addService('vue', vueService);
	addService('panoramique', panoramique);
});