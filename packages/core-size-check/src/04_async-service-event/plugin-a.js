import {pluginB} from './index.js';
import {definePlugin, dependsOn, onEvent} from '@xoram/core';

export default definePlugin(() => {
	dependsOn(pluginB.id);
	onEvent('service', '*', console.log);
});