import type { Application } from '@xoram/core';
import { defineService } from '@xoram/core';
import { failure, type Result, success } from '@xoram/utils/result';
import type { Immutable } from '../api/immutable';
import {
	type Realm,
	RealmError,
	type Realms,
	type State,
	StateError,
	type StateNotification,
	type StateService,
} from '../api/state.service';
import type { Transaction as TransactionInterface } from '../api/transaction';
import { Transaction } from './transaction';


/**
 * @public
 */
export const stateService: (app: Application) => StateService = defineService<StateNotification, StateService & State>(
	(_app, emitter) => {
		return {
			realms: {} as Immutable<Realms>,
			claim(name: string, initialValue: Realm = {}): Result<Readonly<Realm>, RealmError> {
				if (name in this.realms) {
					return failure(new RealmError(`Tried to claim realm '${ name }', but it has already been claimed.`));
				}
				(this.realms as Realms)[name] = initialValue;
				return success(this.realms[name]);
			},
			transaction(): TransactionInterface {
				return new Transaction();
			},
			apply(transaction: TransactionInterface): Result<boolean, StateError> {
				if (transaction.steps.length === 0) {
					return success(true);
				}
				if (transaction.getMeta('isApplied')) {
					return failure(new StateError('Tried to applied an already applied transaction.'));
				}

				let prevented = false;
				emitter.emit('beforeTransactionApply', { transaction, prevent: () => {prevented = true;} });
				if (prevented) {
					return success(false);
				}

				const applicationResult = transaction.apply(this);

				if (!applicationResult.ok) {
					return failure(new StateError('Failed to apply Transaction', { cause: applicationResult.reason }));
				}

				emitter.emit('afterTransactionApply', { transaction });

				return success(true);
			},
		};
	});