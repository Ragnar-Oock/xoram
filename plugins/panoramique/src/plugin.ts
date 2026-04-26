import { addService, definePlugin, onBeforeDestroy } from '@xoram/core';
import { createPinia, disposePinia, type Pinia } from 'pinia';
import { panoramique } from './service/panoramique.service';
import { vueService } from './service/vue.service';

/**
 * Provide the {@link PanoramiqueStore panoramique}, {@link VueService vue} and {@link PiniaService pinia} services to
 * enable the use of Vue components to build dynamic UIs.
 *
 * @public
 */
export const panoramiquePlugin = definePlugin('panoramique', () => {
	addService('vue', vueService);
	addService('pinia', ({ services }) => {
		const pinia: Pinia = createPinia()
			.use(({ store }) => {
				// Add the emitter key to pinia stores to allow defineService to inject the emitter when registering the store
				// as a service don't use the return syntax to avoid having the emitter in the devtools
				store.emitter = {};
			});
		services.vue.app.use(pinia);

		onBeforeDestroy(() => {
			disposePinia(pinia);
		});

		return { pinia };
	});
	addService('panoramique', panoramique);
});