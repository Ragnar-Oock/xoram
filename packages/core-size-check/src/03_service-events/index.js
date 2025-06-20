import {addService, createApp, definePlugin, defineService, dependsOn, onEvent} from '@xoram/core';

const pluginA = definePlugin(() => {
	dependsOn(pluginB.id);
	onEvent('service', '*', console.log);
});
const pluginB = definePlugin(() => {
	addService('service', defineService());
});
createApp([pluginB, pluginA]);