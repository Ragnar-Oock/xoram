import type { CanCommand, ChainedCommand, SingleCommand } from './command.service';
import type { StateService } from './state.service';
import type { Transaction } from './transaction';

export interface CommandParameters {
	/**
	 * The state a command's {@link Step | steps} will act upon.
	 */
	state: StateService,
	/**
	 * The transaction to add steps to
	 */
	transaction: Transaction,
	/**
	 * A transaction dispatch function.
	 * If it is not given the command should perform a dry run,
	 * @param transaction
	 */
	dispatch: ((transaction: Transaction) => void) | undefined,
	/**
	 * A chain initiator.
	 *
	 * Commands called with this chain will be run as part of the same
	 * {@link CommandParameters.transaction | transaction} as the current command.
	 */
	chain: ChainedCommand;
	/**
	 * A set of all available commands to check if they can be played in the current context.
	 */
	can: CanCommand;
	/**
	 * A set of all available commands.
	 *
	 * Commands called from this collection will be run as part of the same
	 * {@link CommandParameters.transaction | transaction} as the current command.
	 */
	command: SingleCommand;
}

/**
 * Add the steps implementing the command's action to the given transaction
 *
 * @returns can the command be played in the current context ?
 */
export type Command = (parameters: CommandParameters) => boolean;

/**
 * Accept arbitrary arguments and create a command function.
 * The arguments will be provided when the command is invoked by client code.
 */
export type CommandConstructor<arguments extends any[]> = (...args: arguments) => Command;