import {addService, createApp, defineAsyncPlugin, definePlugin, defineService} from '@xoram/core';


export const pluginB = definePlugin(() => {
	addService('service', defineService());
});
let res;
createApp([
	pluginB,
	defineAsyncPlugin(
		async () => (await import('./plugin-a.js')).default,
		() => new Promise(resolve => res = resolve)),
]);

res();