import type { StateService } from './state.service';
import type { Transaction } from './transaction';

/**
 * Add the steps implementing the command's action to the given transaction
 *
 * @param state - the state the command's {@link Step | steps} will act upon
 * @param transaction - the transaction to add steps to
 * @param dispatch - a transaction dispatch function. If it is not given the command should perform a dry run,
 *
 * @returns can the command be played in the current context ?
 */
export type Command = (
	state: StateService,
	transaction: Transaction,
	dispatch?: (transaction: Transaction) => void,
) => boolean;

/**
 * Accept arbitrary arguments and create a command function.
 * The arguments will be provided when the command is invoked by client code.
 */
export type CommandConstructor<arguments extends any[]> = (...args: arguments) => Command;