import { type Application, createApp, definePlugin, destroyApp, onBeforeCreate } from '@xoram/core';
import { afterEach, beforeEach, describe, expect, it, type RunnerTestCase, vi } from 'vitest';
import {
	defaultCommanderPlugin as commanderPlugin,
	HistoryError,
	type HistoryService,
	type Step,
	type Transaction,
	TransactionError,
} from '../../src';
import { failure } from '../../src/api/result';
import { ReplaceTestValueStep } from '../replace-test-value.step';

function isTransaction(candidate: unknown): candidate is Transaction {
	return (
		candidate !== null
		&& typeof candidate === 'object'
		&& Array.isArray(candidate.steps as Step[])
		&& ([ 'add', 'apply', 'reverse' ] as const)
			.every(method => typeof (candidate as Transaction)[method] === 'function')
	);
}

const initializeApp = (task: RunnerTestCase) => createApp([ commanderPlugin ], { id: task.name });
//
// function onFail<payload, error extends Error, U>(
// 	result: Result<payload, error>,
// 	cb: (reason: error) => U,
// ): U | undefined {
// 	return result.ok ? undefined : cb(result.reason);
// }

describe('history service', () => {

	describe('initial state', () => {
		describe('root commit', () => {
			it('should be the `present` on initialization', ({ task }) => {
				const app = initializeApp(task);
				const history: HistoryService = app.services.history;

				expect(history.present).toBeTypeOf('object');
				expect(history.present).not.toBe(null);

				destroyApp(app);
			});
			it('should have no parent', ({ task }) => {
				const app = initializeApp(task);

				expect(app.services.history.present).not.toHaveProperty('parent');

				destroyApp(app);
			});
			it('should hold an empty transaction', ({ task }) => {
				const app = initializeApp(task);

				expect(app.services.history.present).toHaveProperty('transaction');
				expect(app.services.history.present.transaction).toSatisfy(isTransaction);

				destroyApp(app);
			});
			it('should have a timestamp at or after the app instantiation', ({ task }) => {
				const beforeTimeStamp = performance.now();
				const app = createApp([ commanderPlugin ], { id: task.name });

				expect(app.services.history.present.time).toBeGreaterThanOrEqual(beforeTimeStamp);

				destroyApp(app);
			});
		});
		describe('timeline', () => {
			it('should have no future commits', ({ task }) => {
				const app = initializeApp(task);

				expect(app.services.history.hasFuture).toBeFalsy();

				destroyApp(app);
			});
			it('should have no past commits', ({ task }) => {
				const app = initializeApp(task);

				expect(app.services.history.hasPast).toBeFalsy();

				destroyApp(app);
			});
		});
	});
});

describe('history service', () => {
	let app: Application;
	beforeEach(({ task }) => {
		app = createApp([
			commanderPlugin, definePlugin(() => {
				onBeforeCreate(app => app.services.state.claim('test', { value: '' }));
			}),
		], { id: task.name });
	});
	afterEach(() => {
		destroyApp(app);
		// @ts-expect-error app will always be defined in places where it is used
		app = undefined;
	});

	function getTransaction() {
		return app.services.history
			.transaction()
			.add(new ReplaceTestValueStep('test', 'noop'));
	}

	describe('commit', () => {
		describe('bail out', () => {
			it(
				'should return the present commit wrapped in a success result when commiting empty transactions',
				() => {
					const present = app.services.history.present;
					const result = app.services.history.commit(app.services.history.transaction());

					if (result.ok) {
						expect(result.value).toBe(present);
					}
					else {
						expect.fail('returned a failure');
					}
				},
			);
			it('should return a failure result when the transaction application errors out', () => {
				const mockTransaction = getTransaction();
				mockTransaction.apply = () => failure(new Error('expect failure') as TransactionError);

				const result = app.services.history.commit(mockTransaction);

				if (result.ok) {
					expect.fail('returned a success');
				}
				else {
					expect(result.reason).toBeInstanceOf(HistoryError);
				}
			});
			it('should return a failure result when trying to commit an already applied transaction', () => {
				const transaction = getTransaction();

				expect(app.services.history.commit(transaction).ok).toBeTruthy();

				const secondCommitResult = app.services.history.commit(transaction);
				if (secondCommitResult.ok) {
					expect.fail(
						secondCommitResult,
						expect.objectContaining({ ok: false, reason: expect.any(Error) }),
						'Expected a failure',
					);
				}
				else {
					expect(secondCommitResult.reason).toBeInstanceOf(HistoryError);
				}
			});
		});
		describe('success', () => {
			it('should replace the present commit', () => {
				const transaction = getTransaction();

				const present = app.services.history.present;

				app.services.history.commit(transaction);

				expect(app.services.history.present).not.toBe(present);
			});
			it('should timestamp the commit with the current time', () => {
				const transaction = getTransaction();

				const before = performance.now();
				app.services.history.commit(transaction);
				const after = performance.now();

				expect(app.services.history.present.time).toBeGreaterThanOrEqual(before);
				expect(app.services.history.present.time).toBeLessThanOrEqual(after);
			});
			it('should return the newly created present commit wrapped in a success result', () => {
				const transaction = getTransaction();
				const result = app.services.history.commit(transaction);

				if (result.ok) {
					expect(result.value).toBe(app.services.history.present);
				}
				else {
					expect.fail(
						result,
						expect.objectContaining({ ok: true, value: expect.anything() }),
						'Expected a success',
					);
				}
			});
			it('should create a commit with the previous present as parent', () => {
				const present = app.services.history.present;
				const transaction = getTransaction();

				app.services.history.commit(transaction);

				expect(app.services.history.present.parent).toBe(present);
			});
		});
		it('should invoke the transaction .apply() method', () => {
			const transaction = getTransaction();
			vi.spyOn(transaction, 'apply');

			app.services.history.commit(transaction);

			expect(transaction.apply).toHaveBeenCalledExactlyOnceWith(app.services.state);
		});
	});

	describe('transaction', () => {
		it('should return a transaction', () => {
			const transaction = app.services.history.transaction();
			const transactionProps = [ 'apply', 'reverse', 'add' ];

			for (const transactionProp of transactionProps) {
				expect(transaction).toHaveProperty(transactionProp);
			}

			expect(transaction.steps).toBeInstanceOf(Array);
		});
		it('should return an empty transaction', () => {
			const transaction = app.services.history.transaction();
			expect(transaction.steps).toHaveLength(0);
		});
		it('should create a new transaction object each time', () => {
			const transaction = app.services.history.transaction();
			expect(app.services.history.transaction()).not.toBe(transaction);
		});
	});

	describe('undo', () => {
		describe('bail out', () => {
			it.todo(
				'should return a failure holding an error when the transaction of the last commit fails to unapply',
				() => {},
			);
		});
		describe('success', () => {
			it.todo('should unapply the transaction of the present commit', () => {});
			it.todo('should set the present commit to its parent', () => {});
			it.todo('should create a future branch', () => {});
			it.todo('should return a falsy success when called without a past', () => {});
		});
	});

	describe('redo', () => {
		it.todo('should return a falsy success when called without a future', () => {});
		it.todo('should apply a transaction equivalent to the previously undo one', () => {});
		it.todo('should create a new present commit', () => {});
		it.todo('should return a truthy success', () => {});
	});

	describe('hasFuture', () => {
		it.todo('should be true when a commit has been successfully undone', () => {});
		it.todo('should be false when a transaction has been commited over an undone commit', () => {});
		it.todo('should be false when no commit has been undone', () => {});
	});

	describe('hasPast', () => {
		it.todo('should be true when a transaction has been successfully commited', () => {});
		it.todo('should be false when no transaction has been commited', () => {});
		it.todo('should be false when all commits have been successfully undone', () => {});
	});
});