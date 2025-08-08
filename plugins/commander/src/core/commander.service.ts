import type { Application } from '@xoram/core';
import { defineService, handleError } from '@xoram/core';
import type { CommandConstructor } from '../api/command';
import type {
	CanCommand,
	ChainedCommand,
	CommandCollection,
	CommanderNotifications,
	CommandService,
	Invoker,
	NonNever,
	SingleCommand,
} from '../api/command.service';
import type { Transaction } from '../api/transaction';

type _Commands = {
	[name in keyof CommandCollection as CommandCollection[name] extends never
		? never
		: name]: CommandConstructor<Parameters<CommandCollection[name]>>;
}
/**
 * Stand in object used as the target of proxies implementing the .commands, .can and .chain methods of CommandService
 */
const EMPTY = {};

/**
 * @internal
 */
export const commandService: (app: Application) => CommandService = defineService<CommanderNotifications, CommandService>(
	(app) => {
		const _commands: _Commands = {} as _Commands;

		const commitWithErrorHandling = (transaction: Transaction): boolean => {
			const result = app.services.history.commit(transaction);
			if (!result.ok) {
				handleError(result.reason, undefined, app, 'unknown');
			}
			return result.ok;
		};

		/**
		 * Create a chain of commands to apply on the given transaction.
		 * @param transaction the transaction commands should add their steps to
		 * @param dispatch the dispatch function to pass to the commands invoked in the chain
		 */
		function getChain(transaction: Transaction, dispatch?: (transaction: Transaction) => void): ChainedCommand {
			let chainHasBeenRan = false;
			const commandResults: boolean[] = [];
			const chain = new Proxy(EMPTY as ChainedCommand, {
				get: (_, property): (() => ChainedCommand) | Invoker | undefined => {
					// invoke the chain
					if (property === 'run') {
						return () => {
							// prevent re-running a chain
							if (chainHasBeenRan) {
								handleError(
									new Error('Called .run() on a command chain that has already been run.'),
									undefined,
									app,
									'unknown',
								);
								return false;
							}
							chainHasBeenRan = true;

							if (!dispatch) {
								return commandResults.every(Boolean);
							}

							return commitWithErrorHandling(transaction);
						};
					}

					const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;

					// no command exists with the name held by property
					if (!commandConstructor) {return undefined;}

					// add a command in the chain
					return (...args: unknown[]) => {
						commandResults.push(
							commandConstructor(...args)(app.services.state, transaction, dispatch),
						);
						return chain;
					};
				},
			});

			return chain;
		}

		return {
			register<commandName extends keyof NonNever<CommandCollection>>(
				name: commandName,
				command: CommandConstructor<Parameters<CommandCollection[commandName]>>,
			): CommandService {
				if (name in _commands) {return this as CommandService;}

				_commands[name] = command as CommandConstructor<unknown[]>;

				return this as CommandService;
			},

			get can(): CanCommand {
				const transaction = app.services.history.transaction();
				const dispatch = undefined;
				return new Proxy(EMPTY as CanCommand, {
					get: (_, property): ChainedCommand | Invoker | undefined => {
						if (property === 'chain') {
							return getChain(transaction, dispatch);
						}

						const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
						if (!commandConstructor) {return undefined;}

						return (...args: unknown[]) => (
							commandConstructor(...args)(app.services.state, transaction, dispatch)
							&& commitWithErrorHandling(transaction)
						);
					},
				});
			},

			get chain(): ChainedCommand {
				return getChain(app.services.history.transaction(), () => void 0);
			},

			get commands(): SingleCommand {
				const transaction = app.services.history.transaction();
				return new Proxy(EMPTY as SingleCommand, {
					get: (_, property): Invoker | undefined => {
						const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
						if (!commandConstructor) {return undefined;}

						return (...args: unknown[]) => (
							commandConstructor(...args)(app.services.state, transaction, () => void 0)
							&& commitWithErrorHandling(transaction)
						);
					},
				});
			},
		};
	});