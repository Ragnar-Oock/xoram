import { addService, type Application, definePlugin, onBeforeCreate, type PluginDefinition } from '@xoram/core';
import type { HistoryService } from '../api/history.service';
import type { StateService } from '../api/state.service';
import { commandService } from './commander.service';
import { historyService as history } from './history.service';
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
	/**
	 * A factory to create the history service.
	 *
	 * Use the default {@link historyService} or a custom one implementing the {@link HistoryService} interface
	 * @param app
	 */
	history: (app: Application) => HistoryService;
}

/**
 * @public
 */
export const commanderPlugin: (config: CommanderConfig) => PluginDefinition = ({ state, history }) => definePlugin(
	'commander',
	() => {
		addService('state', state);
		addService('commander', commandService);
		addService('history', history);

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

export const defaultCommanderPlugin = commanderPlugin({
	state,
	history,
});