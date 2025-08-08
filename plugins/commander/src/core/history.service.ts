import type { Application } from '@xoram/core';
import { defineService } from '@xoram/core';
import type { Commit, HistoryNotifications, HistoryService } from '../api/history.service';
import { HistoryError } from '../api/history.service';
import { failure, type Result, success } from '../api/result';
import type { State } from '../api/state.service';
import type { Transaction as TransactionInterface } from '../api/transaction';
import { Transaction } from './transaction';

/**
 * @internal
 */
export const historyService: (app: Application) => HistoryService = defineService<HistoryNotifications, HistoryService>(
	app => {
		const root: Commit = { time: performance.now(), transaction: new Transaction() };
		let head: Commit = root;
		let future: Commit | undefined;

		return {
			commit(transaction: Transaction): Result<Commit, HistoryError> {
				if (transaction.steps.length === 0) {
					return success(head);
				}
				let result = transaction.apply(app.services.state as State);

				if (!result.ok) {
					return failure(new HistoryError('Failed to commit transaction', { cause: result.reason }));
				}

				head = { transaction: result.value, time: performance.now(), parent: head };
				return success(head);
			},
			get hasFuture(): boolean {return future !== undefined;},
			get hasPast(): boolean {return head !== root;},
			get present(): Commit {return head;},
			redo(): Result<boolean, HistoryError> {
				if (!future) { return success(false); }

				const result = this.commit(future.transaction);

				if (!result.ok) {
					return result;
				}

				future = future.parent;
				return success(true);
			},
			undo(): Result<boolean, HistoryError> {
				if (!this.hasPast) { return success(false); }


				let result = head
					.transaction
					.apply(app.services.state as State);

				if (!result.ok) {
					return failure(new HistoryError('Failed to commit transaction', { cause: result.reason }));
				}

				head = head.parent as Commit;
				future = { transaction: result.value, time: performance.now(), parent: future };

				return success(true);

			},
			transaction(): TransactionInterface {
				return new Transaction();
			},
		};
	});