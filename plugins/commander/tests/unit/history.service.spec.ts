import { addPlugin, type Application, createApp, definePlugin, destroyApp, onBeforeCreate, onEvent } from '@xoram/core';
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
import { IrreversibleReplaceTestValueStep } from '../dummies/irreversible-replace-test-value.step';
import { ReplaceTestValueStep } from '../dummies/replace-test-value.step';

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

declare module '../../src' {
	interface Realms {
		test: { value: string };
	}
}

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

const testValue: string = 'noop';
const initialValue: string = '';
const realm = 'test';

describe('history service', () => {
	let app: Application;
	beforeEach(({ task }) => {
		app = createApp([
			commanderPlugin, definePlugin(() => {
				onBeforeCreate(app => app.services.state.claim(realm, { value: initialValue }));
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
			.add(new ReplaceTestValueStep(realm, -1, -1, testValue));
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
			it(
				'should return a failure holding an error when the transaction of the last commit fails to unapply',
				() => {
					const transaction = app.services.history
						.transaction()
						.add(new IrreversibleReplaceTestValueStep(realm, testValue));

					app.services.history.commit(transaction);

					const result = app.services.history.undo();

					if (result.ok) {
						expect.fail(
							result,
							expect.objectContaining({ ok: false, reason: expect.any(Error) }),
							'Expected a failure',
						);
					}

					expect(result.reason).toStrictEqual(expect.any(HistoryError));
					expect(result.reason.cause).toStrictEqual(expect.any(TransactionError));
					expect((result.reason.cause as TransactionError).cause)
						.toStrictEqual(new Error(`value already set to replacement (${ testValue })`));

				},
			);
		});
		describe('success', () => {
			it('should unapply the transaction of the present commit', () => {
				const transaction = getTransaction();

				app.services.history.commit(transaction);

				expect(app.services.state.realms[realm].value).toBe(testValue);

				const result = app.services.history.undo();

				if (!result.ok) {
					expect.fail(
						result,
						expect.objectContaining({ ok: true, value: true }),
						'Expected a success',
					);
				}
				else {
					expect(result.value).toBeTruthy();
				}

			});
			it('should set the present commit to its parent', () => {
				const transaction = getTransaction();

				app.services.history.commit(transaction);

				expect(app.services.state.realms[realm].value).toBe(testValue);

				const present = app.services.history.present;

				const result = app.services.history.undo();

				if (!result.ok) {
					return expect.fail(
						result,
						expect.objectContaining({ ok: true, value: true }),
						'Expected a success',
					);
				}

				expect(app.services.history.present).toBe(present.parent);

			});
			it('should create a future branch', () => {
				const transaction = getTransaction();

				app.services.history.commit(transaction);

				expect(app.services.state.realms[realm].value).toBe(testValue);
				expect(app.services.history.hasFuture).toBeFalsy();

				const result = app.services.history.undo();

				if (!result.ok) {
					return expect.fail(
						result,
						expect.objectContaining({ ok: true, value: true }),
						'Expected a success',
					);
				}

				expect(app.services.history.hasFuture).toBeTruthy();
			});
			it('should return a falsy success when called without a past', () => {
				expect(app.services.history.hasPast).toBeFalsy();

				const result = app.services.history.undo();

				if (!result.ok) {
					return expect.fail(
						result,
						expect.objectContaining({ ok: true, value: true }),
						'Expected a success',
					);
				}

				expect(result.value).toBeFalsy();
			});
		});
	});

	describe('redo', () => {
		it('should return a falsy success when called without a future', () => {
			expect(app.services.history.hasFuture).toBeFalsy();

			const result = app.services.history.redo();

			if (!result.ok) {
				return expect.fail(
					result,
					expect.objectContaining({ ok: true, value: true }),
					'Expected a success',
				);
			}

			expect(result.value).toBeFalsy();
		});
		it('should apply a transaction equivalent to the previously undo one', () => {
			const transaction = getTransaction();

			app.services.history.commit(transaction);

			expect(app.services.state.realms[realm].value).toBe(testValue);

			app.services.history.undo();

			expect(app.services.state.realms[realm].value).toBe(initialValue);

			app.services.history.redo();

			expect(app.services.state.realms[realm].value).toBe(testValue);

		});
		it('should create a new present commit', () => {
			const transaction = getTransaction();

			app.services.history.commit(transaction);

			const present = app.services.history.present;

			app.services.history.undo();
			app.services.history.redo();

			expect(app.services.history.present).not.toBe(present);

		});
		it('should return a truthy success', () => {
			const transaction = getTransaction();

			app.services.history.commit(transaction);
			app.services.history.undo();

			const result = app.services.history.redo();

			if (!result.ok) {
				return expect.fail(
					result,
					expect.objectContaining({ ok: true, value: true }),
					'Expected a success',
				);
			}
			expect(result.value).toBeTruthy();
		});
	});

	describe('hasFuture', () => {
		it('should be true when a commit has been successfully undone', () => {
			const transaction = getTransaction();

			app.services.history.commit(transaction);

			expect(app.services.history.hasFuture).toBeFalsy();

			app.services.history.undo();

			expect(app.services.history.hasFuture).toBeTruthy();
		});
		it('should be false when a transaction has been commited over an undone commit', () => {
			app.services.history.commit(getTransaction());
			app.services.history.undo();

			app.services.history.commit(getTransaction());

			expect(app.services.history.hasFuture).toBeFalsy();
		});
		it('should be false when no commit has been undone', () => {
			app.services.history.commit(getTransaction());

			expect(app.services.history.hasFuture).toBeFalsy();
		});
	});

	describe('hasPast', () => {
		it('should be true when a transaction has been successfully commited', () => {
			app.services.history.commit(getTransaction());

			expect(app.services.history.hasPast).toBeTruthy();
		});
		it('should be false when no transaction has been commited', () => {
			expect(app.services.history.hasPast).toBeFalsy();
		});
		it('should be false when all commits have been successfully undone', () => {
			app.services.history.commit(getTransaction());
			app.services.history.undo();
			expect(app.services.history.hasPast).toBeFalsy();
		});
	});

	describe('hooks', () => {
		describe('beforeCommit', () => {
			it('should emit beforeCommit before applying a transaction', () => {
				let hadPast = false;
				const spy = vi.fn(() => hadPast = app.services.history.hasPast);

				addPlugin(definePlugin(() => {
					onEvent('history', 'beforeCommit', spy);
				}), app);

				expect(spy).not.toHaveBeenCalled();

				app.services.history.commit(getTransaction());

				// hasPast depends on the existence of a commit in the history, we want to make sure the event was emitted
				// before any commit is added to it
				expect(spy).toHaveBeenCalled();
				expect(hadPast).toBeFalsy();
			});
			it('should not emit beforeCommit when the transaction is empty', () => {
				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'beforeCommit', spy);
				}), app);

				expect(spy).not.toHaveBeenCalled();

				app.services.history.commit(app.services.history.transaction());

				expect(spy).not.toHaveBeenCalled();
			});
			it('should not emit beforeCommit when the transaction has already been commited', () => {
				const transaction = getTransaction();

				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'beforeCommit', spy);
				}), app);
				// first commit
				app.services.history.commit(transaction);
				// recommit same transaction
				app.services.history.commit(transaction);

				expect(spy).toHaveBeenCalledOnce();
			});
			it('should pass the transaction to be commited in the payload', () => {
				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'beforeCommit', spy);
				}), app);

				const transaction = getTransaction();
				app.services.history.commit(transaction);

				expect(spy).toHaveBeenCalledWith({ transaction });
			});
		});
		describe('afterCommit', () => {
			it('should emit afterCommit after emitting beforeCommit', () => {
				let calls: string[] = [];

				addPlugin(definePlugin(() => {
					onEvent('history', 'afterCommit', () => calls.push('afterCommit'));
					onEvent('history', 'beforeCommit', () => calls.push('beforeCommit'));
				}), app);

				app.services.history.commit(getTransaction());

				expect(calls).toEqual([ 'beforeCommit', 'afterCommit' ]);
			});
			it('should emit afterCommit after saving a new commit', () => {
				let hadPast = false;

				addPlugin(definePlugin(() => {
					onEvent('history', 'afterCommit', () => hadPast = app.services.history.hasPast);
				}), app);

				app.services.history.commit(getTransaction());

				// hasPast depends on the existence of a commit in the history
				expect(hadPast).toBeTruthy();
			});
			it('should not emit afterCommit when the transaction fails to apply', () => {
				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'afterCommit', spy);
				}), app);

				expect(spy).not.toHaveBeenCalled();

				app.services.history.commit(app.services.history.transaction());

				expect(spy).not.toHaveBeenCalled();
			});
			it('should not emit afterCommit when the transaction has already been commited', () => {
				const transaction = getTransaction();

				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'afterCommit', spy);
				}), app);
				// first commit
				app.services.history.commit(transaction);
				// recommit same transaction
				app.services.history.commit(transaction);

				expect(spy).toHaveBeenCalledOnce();
			});
			it('should pass the expected payload', () => {
				const spy = vi.fn();
				addPlugin(definePlugin(() => {
					onEvent('history', 'afterCommit', spy);
				}), app);

				const transaction = getTransaction();
				app.services.history.commit(transaction);

				expect(spy).toHaveBeenCalledWith({ transaction });
			});
		});
	});
});