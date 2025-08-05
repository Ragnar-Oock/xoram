import { defineService, type Service } from '@xoram/core';
import { BaseTransaction } from './base-transaction';

export interface CommandCollection {
	// commands will be added here with module augmentation
	undo: () => void;

	// Reserved for the chain functionality.
	run: never;
	// Reserved for the chain functionality.
	chain: never;
}

/**
 * Run a command and apply the transaction if appropriate.
 */
export type Invoker<name extends keyof CommandCollection = keyof CommandCollection> = (...args: Parameters<CommandCollection[name]>) => boolean;

export type SingleCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: Invoker<name>;
}
export type ChainedCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never
		? never
		: name]: (...args: Parameters<CommandCollection[name]>) => ChainedCommand;
} & {
	run: Invoker;
}

export type CanCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: Invoker<name>;
} & {
	chain: ChainedCommand;
}

export type CommanderNotifications = {
	beforeTransactionDispatch: { transaction: Transaction };
	afterTransactionDispatch: { transaction: Transaction };
}

export interface Commander extends Service<CommanderNotifications> {
	/**
	 * A set of all commands available to run on their own, each call creates a step in the history.
	 */
	get commands(): SingleCommand;

	/**
	 * A set of all commands available to run as a group, a chain of command will create a single step in the history.
	 * You can add more commands by invoking the corresponding method in the returned object. Execute the chain by calling
	 * the `.run()` method.
	 *
	 * ⚠️ do not reuse a chain once you called the `.run()` method on it.
	 */
	get chain(): ChainedCommand;

	/**
	 * A set of all commands available to check if they can be played in the current context.
	 *
	 * When used in concert with `.chain` will return `false` if at least one command in the chain can't run.
	 *
	 * Remember to call `.run()` to complete the check when used with `.chain()`.
	 */
	get can(): CanCommand;

	/**
	 * Add a new command.
	 * @param name a valid JS identifier string, will be used to invoke the command.
	 * @param command the command implementation.
	 */
	register: <commandName extends keyof NonNever<CommandCollection>>(
		name: commandName,
		command: CommandConstructor<Parameters<CommandCollection[commandName]>>,
	) => this;
}

/**
 * Add the steps implementing the command's action to the given transaction
 * @param transaction the transaction to add steps to
 * @param dispatch
 * @returns can the command be played in the current context ?
 */
export type Command = (transaction: Transaction, dispatch?: (transaction: Transaction) => void) => boolean;

export type CommandConstructor<arguments extends any[]> = (...args: arguments) => Command;

export interface Step {
	/**
	 * Execute the steps action
	 */
	apply: () => void;
	/**
	 * Undo the actions taken in `apply`
	 */
	remove: () => void;
}

export interface Transaction {
	/**
	 * add a step in the transaction to be played when the transaction is applied
	 * @param step
	 */
	add: (step: Step) => this;
	/**
	 * Apply all the steps in order.
	 *
	 * Will try to undo applied steps if on throws and error.
	 *
	 * @throws TransactionError failed to undo applied steps after error
	 */
	apply: () => boolean;
	/**
	 * Undo all the steps in reverse order
	 */
	remove: () => boolean;
}

/**
 * Filter out any property of `record` that evaluates to `never`.
 *
 * @public
 */
export type NonNever<record> = {
	[K in keyof record as record[K] extends never ? never : K]: record[K];
}


type _Commands = {
	[name in keyof CommandCollection as CommandCollection[name] extends never
		? never
		: name]: CommandConstructor<Parameters<CommandCollection[name]>>;
}

export const commandService = defineService<CommanderNotifications, Commander>(() => {
	const _commands: _Commands = {} as _Commands;

	/**
	 * Create a chain of commands to apply on the given transaction.
	 * @param transaction the transaction commands should add their steps to
	 * @param dispatch the dispatch function to pass to the commands invoked in the chain
	 */
	function getChain(transaction: Transaction, dispatch?: (transaction: Transaction) => void): ChainedCommand {
		const chain = new Proxy({} as ChainedCommand, {
			get: (_, property): (() => ChainedCommand) | Invoker | undefined => {
				// invoke the chain
				if (property === 'run') {
					return () => transaction.apply();
				}

				const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;

				// no command exists with the name held by property
				if (!commandConstructor) {return undefined;}

				// add a command in the chain
				return (...args: unknown[]) => {
					commandConstructor(...args)(transaction, dispatch);
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
		): Commander {
			if (name in _commands) {return this as Commander;}

			_commands[name] = command as CommandConstructor<unknown[]>;

			return this as Commander;
		},

		get can(): CanCommand {
			const transaction = new BaseTransaction();
			const dispatch = undefined;
			return new Proxy({} as CanCommand, {
				get: (_, property): ChainedCommand | Invoker | undefined => {
					if (property === 'chain') {
						return getChain(transaction, dispatch);
					}

					const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
					if (!commandConstructor) {return undefined;}

					return (...args: unknown[]) => commandConstructor(...args)(transaction, dispatch) && transaction.apply();
				},
			});
		},

		get chain(): ChainedCommand {
			return getChain(new BaseTransaction(), () => void 0);
		},

		get commands(): SingleCommand {
			const transaction = new BaseTransaction();
			return new Proxy({} as SingleCommand, {
				get: (_, property): Invoker | undefined => {
					const commandConstructor = _commands[property as keyof _Commands] as CommandConstructor<unknown[]> | undefined;
					if (!commandConstructor) {return undefined;}

					return (...args: unknown[]) => commandConstructor(...args)(transaction, () => void 0) && transaction.apply();
				},
			});
		},
	};
});