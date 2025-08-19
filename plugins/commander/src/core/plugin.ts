import { addService, type Application, definePlugin, onBeforeCreate, type PluginDefinition } from '@xoram/core';
import type { StateService } from '../api/state.service';
import { commandService } from './commander.service';
import { stateService as state } from './state.service';

export type CommanderConfig = {
	/**
	 * A factory to create the state service.
	 *
	 * Use the default {@link stateService} or a custom one implementing the {@link StateService} interface.
	 *
	 * @param app
	 */
	state: (app: Application) => StateService,
}

/**
 * @public
 */
export const commanderPlugin: (config: CommanderConfig) => PluginDefinition = ({ state }) => definePlugin(
	'commander',
	() => {
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

export const defaultCommanderPlugin = commanderPlugin({ state });