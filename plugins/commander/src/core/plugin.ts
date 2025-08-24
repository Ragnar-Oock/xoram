import { addService, definePlugin, onBeforeCreate, type PluginDefinition } from '@xoram/core';
import { commandService } from './commander.service';
import { stateService as state } from './state.service';

/**
 * @public
 */
export const commanderPlugin: PluginDefinition = definePlugin('commander', () => {
		addService('state', state);
		addService('commander', commandService);

		onBeforeCreate(app => {
			app.services
				.commander
				.register('setMeta', (meta, value) => ({ transaction }) => {
					transaction.setMeta(meta, value);
					return true;
				});
		});
	},
);
