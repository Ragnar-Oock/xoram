import { addService, definePlugin } from '@xoram/core';
import { historyService } from './history.service';

/**
 * @public
 */
export const basicHistoryPlugin = definePlugin('basic-history', () => {
	addService('history', historyService);
});