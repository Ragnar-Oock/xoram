import type { Result } from './result';
import type { State } from './state.service';
import type { Step } from './step';
import type { TransactionError } from './transaction-error';

export interface Transaction {
	readonly steps: readonly Step[];
	/**
	 * add a step in the transaction to be played when the transaction is applied
	 * @param step
	 */
	add: (step: Step) => this;
	/**
	 * Apply all the steps in order.
	 *
	 * Will try to undo applied steps if on throws and error.
	 */
	apply: (state: State) => Result<void, TransactionError>;
	/**
	 * Create a new transaction that does the opposite as the current one
	 */
	reverse: () => Transaction;
}