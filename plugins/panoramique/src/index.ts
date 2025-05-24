import type { PanoramiqueService } from './services/panoramique.service';
import type { VueService } from './services/vue.service';


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

export type {
	VueService,
	PanoramiqueService,
};

export { panoramiquePlugin } from './plugin';