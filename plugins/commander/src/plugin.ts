import { addService, definePlugin } from '@xoram/core';
import { commandService } from './commander.service';

/**
 * @public
 */
export const commanderPlugin = definePlugin('commander', () => {
	addService('commander', commandService);
});