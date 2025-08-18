import type { Service } from '@xoram/core';
import type { Immutable } from './immutable';
import type { Result } from './result';
import type { Transaction } from './transaction';

export type Realm = object;

export interface Realms {
	[name: string]: Realm;
}

export type StateNotification = {
	realClaimed: { name: string };
} & Record<string, unknown>

export interface StateService extends Service<StateNotification> {
	readonly realms: Immutable<Realms>;

	/**
	 * Register a space for historisable data to be stored.
	 * @param name - a unique identifier used to edit the realm's data in steps and read from it
	 * @param initialValue - a value to set the realm to when creating it
	 */
	claim(name: keyof Realms, initialValue?: Realm): Result<Immutable<Realm>, RealmError>;


	/**
	 * Create a new transaction for the {@link CommandService} to consume.
	 */
	transaction(): Transaction;
}

/**
 * Allow read and write to the realms by steps.
 */
export interface State {
	realms: Readonly<Realms>;
}

export class RealmError extends Error {
	constructor(reason: string, cause?: Error) {
		super(`Unable to claim realm: ${ reason }`, { cause });
	}
}