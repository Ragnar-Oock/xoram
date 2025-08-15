import type { Application } from '@xoram/core';
import { defineService, handleError } from '@xoram/core';
import type { CommandConstructor, CommandParameters } from '../api/command';
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

		function createCommandParameters(
			transaction?: Transaction,
			shouldDispatch = true,
		): CommandParameters {
			const parameters = {
				get chain() { return getChain(transaction, shouldDispatch); },
				get can() { return getCan(transaction); },
				get command() {
					return new Proxy(EMPTY as SingleCommand, {
						get: (_, property): Invoker | undefined => {
							const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
							if (!commandConstructor) {return undefined;}

							return (...args: unknown[]) => (
								commandConstructor(...args)(parameters)
								&& commitWithErrorHandling(transaction)
							);
						},
					});
				},
				state: app.services.state,
				transaction,
				dispatch: shouldDispatch ? () => undefined : undefined,
			} satisfies CommandParameters;

			return parameters;
		}

		function getCan(transaction = app.services.history.transaction()) {
			return new Proxy(EMPTY as CanCommand, {
				get: (_, property): ChainedCommand | Invoker | undefined => {
					if (property === 'chain') {
						return getChain(transaction, false);
					}

					const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
					if (!commandConstructor) {return undefined;}

					return (...args: unknown[]) => (
						commandConstructor(...args)(createCommandParameters(transaction, false))
						&& commitWithErrorHandling(transaction)
					);
				},
			});
		}

		/**
		 * Create a chain of commands to apply on the given transaction.
		 * @param transaction the transaction commands should add their steps to
		 * @param shouldDispatch should the chain be created in dry run mode ?
		 */
		function getChain(transaction?: Transaction, shouldDispatch = true): ChainedCommand {
			let chainHasBeenRan = false;
			const hadTransaction = transaction !== undefined;
			const _transaction = transaction ?? app.services.history.transaction();
			const commandResults: boolean[] = [];
			const parameters = createCommandParameters(_transaction, shouldDispatch);
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

							// if a transaction was passed in we defer commiting the transaction to the code that created it, so
							// we only check if the chain can run or not
							return (shouldDispatch && !hadTransaction)
								? commitWithErrorHandling(_transaction)
								: commandResults.every(Boolean);
						};
					}

					const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;

					// no command exists with the name held by property
					if (!commandConstructor) {return undefined;}

					// add a command in the chain
					return (...args: unknown[]) => {
						commandResults.push(commandConstructor(...args)(parameters));
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
				return getCan();
			},

			get chain(): ChainedCommand {
				return getChain();
			},

			get commands(): SingleCommand {
				const transaction = app.services.history.transaction();
				return new Proxy(EMPTY as SingleCommand, {
					get: (_, property): Invoker | undefined => {
						const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
						if (!commandConstructor) {return undefined;}

						return (...args: unknown[]) => (
							commandConstructor(...args)(createCommandParameters(transaction, true))
							&& commitWithErrorHandling(transaction)
						);
					},
				});
			},
		};
	});