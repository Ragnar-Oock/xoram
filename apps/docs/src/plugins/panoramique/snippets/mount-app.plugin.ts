import { definePlugin, dependsOn, onCreated } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';

export const mountingPlugin = definePlugin('mount-vue-app', () => {
	// declare the dependency on panoramique
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// you can mount to whatever element you want
		app.services.vue.app.mount('#my-app');
	});
});