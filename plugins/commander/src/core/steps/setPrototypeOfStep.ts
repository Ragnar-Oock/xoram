import type { State } from '../../api/state.service';
import type { Step } from '../../api/step';
import { _Step, type PropertyPath } from './step';


export class SetPrototypeOfStep extends _Step {
	constructor(
		protected path: PropertyPath,
		private prototype: object | null,
	) {
		super(path);
	}

	public apply(state: State): State {
		const target = this.followPath<any>(state);

		if (target === undefined || target === null) {
			throw new Error('Unable to set the protype of undefined or null');
		}

		Reflect.setPrototypeOf(target, this.prototype);

		return state;
	}

	public reverse(state: State): Step {
		const target = this.followPath(state);
		if (target === undefined || target === null) {
			throw new Error('Unable to reverse step, state has no member at given path');
		}
		return new SetPrototypeOfStep(this.path, Reflect.getPrototypeOf(target));
	}
}