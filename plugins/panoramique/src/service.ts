import type { PanoramiqueService } from './service/panoramique.service';
import type { VueService } from './service/vue.service';

declare module '@xoram/core' {
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