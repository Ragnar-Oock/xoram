import { panoramiquePlugin } from '@zoram-plugin/panoramique';
import { definePlugin, dependsOn, onCreated } from '@zoram/core';

export const mountingPlugin = definePlugin('mount-vue-app', () => {
	// declare the dependency on panoramique
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// you can mount to whatever element you want
		app.services.vue.app.mount('#my-app');
	});
});