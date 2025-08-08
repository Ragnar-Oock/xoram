import type { Result } from './result';
import type { State } from './state.service';
import type { Step } from './step';
import type { TransactionError } from './transaction-error';

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
}