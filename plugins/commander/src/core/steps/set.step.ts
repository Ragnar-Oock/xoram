import type { State } from '../../api/state.service';
import type { Step } from '../../api/step';
import { _Step, type PropertyPath } from './step';

export class SetStep extends _Step {
	constructor(
		protected path: PropertyPath,
		private value: unknown,
	) {
		super(path);
	}

	public apply(state: State): State {
		const parent = this.targetParent<any>(state);

		parent[this.path.at(-1) as PropertyKey] = this.value;

		return state;
	}

	public reverse(state: State): Step {
		return new SetStep(this.path, this.followPath(state));
	}
}