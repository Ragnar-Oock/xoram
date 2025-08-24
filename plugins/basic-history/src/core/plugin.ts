import { addService, definePlugin, dependsOn } from '@xoram/core';
import { commanderPlugin } from '@xoram/plugin-commander';
import { historyService } from './history.service';

/**
 * @public
 */
export const basicHistoryPlugin = definePlugin('basic-history', () => {
	dependsOn(commanderPlugin.id);
	addService('history', historyService);
});