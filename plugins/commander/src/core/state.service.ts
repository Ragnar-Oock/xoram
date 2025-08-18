import type { Application } from '@xoram/core';
import { defineService } from '@xoram/core';
import { failure, type Result, success } from '../api/result';
import type { Realm, State, StateNotification, StateService } from '../api/state.service';
import { RealmError } from '../api/state.service';


/**
 * @public
 */
export const stateService: (app: Application) => StateService = defineService<StateNotification, StateService & State>(
	() => {
		return {
			realms: {},
			claim(name: string, initialValue: Realm = {}): Result<Readonly<Realm>, RealmError> {
				if (name in this.realms) {
					return failure(new RealmError(`Tried to claim realm '${ name }', but it has already been claimed.`));
				}
				this.realms[name] = initialValue;
				return success(this.realms[name]);
			},
		};
	});