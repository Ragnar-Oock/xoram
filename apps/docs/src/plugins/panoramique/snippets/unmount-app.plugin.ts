import { definePlugin, dependsOn, onBeforeDestroy, onCreated } from '@xoram/core';
import { panoramiquePlugin } from '@xoram/plugin-panoramique';

export default definePlugin(/*[!hint:name:]*/'mount-vue-app', /*[!hint:setup:]*/() => {
	// declare the dependency on panoramique
	dependsOn(panoramiquePlugin.id);

	onCreated(app => {
		// you can mount to whatever element you want
		app.services.vue.app.mount(/*[!hint:rootContainer:]*/'#my-app');
	});

	// [!code highlight:4]
	onBeforeDestroy(app => {
		// unmount the vue app when you are done with it
		app.services.vue.app.unmount();
	});
});