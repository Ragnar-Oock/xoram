import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import { vaporInteropPlugin } from 'vue';
import { panoramiquePlugin } from './plugin';

export default definePlugin('vapor', () => {
	dependsOn(panoramiquePlugin.id);

	onBeforeCreate(({ services }) => {
		services.vue.app.use(vaporInteropPlugin);
	});
});