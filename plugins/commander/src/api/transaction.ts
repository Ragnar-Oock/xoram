import type { Result } from '@xoram/utils/result';
import type { State } from './state.service';
import type { Step } from './step';
import type { TransactionError } from './transaction-error';

export interface TransactionMeta extends Record<string, unknown> {
	// set if the transaction has already been applied to the state it belongs to
	isApplied: true;
}


export interface Transaction {
	readonly steps: readonly Step[];
	/**
	 * add a step in the transaction to be played when the transaction is applied
	 */
	add: (step: Step) => this;
	/**
	 * Apply all the steps in order.
	 *
	 * Will try to undo applied steps if on throws and error.
	 *
	 * @param state - the state to apply the changes to
	 *
	 * @returns a transaction that reverse the applied changes
	 */
	apply: (state: State) => Result<Transaction, TransactionError>;
	/**
	 * Create a new transaction that does the opposite as the current one
	 *
	 * @param state - the state to apply the changes to
	 */
	reverse: (state: State) => Transaction;

	/**
	 * Access a transaction metadata
	 * @see TransactionMeta
	 */
	getMeta: <meta extends keyof TransactionMeta>(name: meta) => TransactionMeta[meta] | undefined;
	/**
	 * Set the value of a transaction metadata
	 * @see TransactionMeta
	 */
	setMeta: <meta extends keyof TransactionMeta>(name: meta, value: TransactionMeta[meta]) => this;

}