import type { Service } from '@xoram/core';
import type { CommandConstructor } from './command';
import type { Transaction } from './transaction';

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

export interface CommandService extends Service<CommanderNotifications> {
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
	 * @param name - a valid JS identifier string, will be used to invoke the command.
	 * @param command - the command implementation.
	 */
	register: <commandName extends keyof NonNever<CommandCollection>>(
		name: commandName,
		command: CommandConstructor<Parameters<CommandCollection[commandName]>>,
	) => this;
}

/**
 * Filter out any property of `record` that evaluates to `never`.
 *
 * @public
 */
export type NonNever<record> = {
	[K in keyof record as record[K] extends never ? never : K]: record[K];
}