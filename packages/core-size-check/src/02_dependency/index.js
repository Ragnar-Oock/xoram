import {createApp, definePlugin, dependsOn} from '@xoram/core';

const pluginA = definePlugin(() => {
	dependsOn(pluginB.id);
});
const pluginB = definePlugin(() => {
});
createApp([pluginB, pluginA]);