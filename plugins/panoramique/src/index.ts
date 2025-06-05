// noinspection ES6UnusedImports
import type { ServiceCollection } from '@zoram/core'; // eslint-disable-line no-unused-vars
import type { PanoramiqueService } from './service/panoramique.service';
import type { VueService } from './service/vue.service';

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