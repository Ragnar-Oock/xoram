import { definePlugin } from '@xoram/core';

/**
* @public
*/
export const commanderPlugin = definePlugin('commander', () => {
	console.log('hi from commander');
});