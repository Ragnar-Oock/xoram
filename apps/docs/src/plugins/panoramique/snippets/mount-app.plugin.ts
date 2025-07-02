import { definePlugin, dependsOn, onCreated } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';

export default definePlugin(/*[!hint:name:]*/'mount-vue-app', /*[!hint:setup:]*/() => {
	// declare the dependency on panoramique
	dependsOn(panoramiquePlugin.id);

	// [!code highlight:4]
	onCreated(app => {
		// you can mount to whatever element you want
		app.services.vue.app.mount(/*[!hint:rootContainer:]*/'#my-app');
	});
});