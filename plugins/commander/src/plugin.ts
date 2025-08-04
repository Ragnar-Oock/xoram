import { addService, definePlugin } from '@xoram/core';
import { CommandService } from './commander.service';

/**
 * @public
 */
export const commanderPlugin = definePlugin('commander', () => {
	addService('commander', new CommandService());
});