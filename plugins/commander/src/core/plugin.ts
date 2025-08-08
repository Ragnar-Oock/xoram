import { addService, definePlugin, type PluginDefinition } from '@xoram/core';
import { commandService } from './commander.service';
import { historyService } from './history.service';
import { stateService } from './state.service';

/**
 * @public
 */
export const commanderPlugin: PluginDefinition = definePlugin('commander', () => {
	addService('state', stateService);
	addService('commander', commandService);
	addService('history', historyService);
});