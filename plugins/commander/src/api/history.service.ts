import type { Service, ServiceNotifications } from '@xoram/core';
import type { Result } from './result';
import type { Transaction } from './transaction';

/**
 * A representation of a mutation in time. A commit is immutable, to modify the history it is part
 * of you will need to create a new commit object.
 */
export interface Commit {
	/**
	 * When was the transaction added to the history.
	 */
	readonly time: number;

	/**
	 * The transaction applied when the commit is in the past.
	 */
	readonly transaction: Transaction;

	/**
	 * The commit preceding this one in the history if any.
	 */
	readonly parent?: Commit;
}

export interface HistoryEvent {
	transaction: Transaction;
}

export interface HistoryNotifications extends ServiceNotifications {
	beforeCommit: HistoryEvent;
	afterCommit: HistoryEvent;
}

/**
 * Apply and store transactions
 */
export interface HistoryService extends Service<HistoryNotifications> {
	/**
	 * Safely perform the effects of a transaction and log it in the history if it did anything
	 *
	 * @param transaction - the transaction to apply.
	 *
	 * @returns the new head commit or the error that prevented its application
	 */
	commit(transaction: Transaction): Result<Commit, HistoryError>;

	/**
	 * Remove the last commit from the history, undo the effects of its transaction and create a new commit in the future
	 * with it.
	 *
	 * @returns was there any changes ? will be `false` if called with en empty history or if the last commit failed to
	 *   undo.
	 */
	undo(): Result<boolean, HistoryError>;

	/**
	 * Reapply a transaction from the future, creating a new commit in the process.
	 */
	redo(): Result<boolean, HistoryError>;

	/**
	 * Was there undone commits ?
	 */
	readonly hasFuture: boolean;

	/**
	 * Has any commit been applied ?
	 */
	readonly hasPast: boolean;

	/**
	 * The last applied and not undone commit. Playing all the commits between the root and this commit
	 * should result in a clone of the current state.
	 */
	readonly present: Commit;

	/**
	 * Create a new transaction for the {@link CommandService} to consume.
	 */
	transaction(): Transaction;
}

export class HistoryError extends Error {}