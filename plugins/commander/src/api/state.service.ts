import type { Service } from '@xoram/core';
import type { Result } from './result';

export type Realm = Record<string, unknown>;

export type StateNotification = {
	realClaimed: { name: string };
} & Record<string, unknown>

export interface StateService extends Service<StateNotification> {
	readonly realms: Readonly<Record<string, Readonly<Realm>>>;

	/**
	 * Register a space for historisable data to be stored.
	 * @param name - a unique identifier used to edit the realm's data in steps and read from it
	 * @param initialValue - a value to set the realm to when creating it
	 */
	claim(name: string, initialValue?: Realm): Result<Readonly<Realm>, RealmError>;
}

/**
 * Allow read and write to the realms by steps.
 */
export interface State {
	realms: Record<string, Realm>;
}

export class RealmError extends Error {
	constructor(reason: string, cause?: Error) {
		super(`Unable to claim realm: ${ reason }`, { cause });
	}
}