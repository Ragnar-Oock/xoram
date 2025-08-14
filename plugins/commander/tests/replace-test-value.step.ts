import { failure, type Result, success } from '../src/api/result';
import type { State } from '../src/api/state.service';
import { type Step } from '../src/api/step';

export class ReplaceTestValueStep implements Step {

	constructor(
		public readonly realm: string,
		public readonly msg: string,
	) {}

	public apply(state: State): Result<State> {
		const realm = state.realms[this.realm] as { value?: string };
		if (typeof realm?.value === 'string') {
			realm.value = this.msg;
			return success(state);
		}
		return failure(new Error('No test realm to write to'));
	}

	public reverse(state: State): Step {
		return new ReplaceTestValueStep(this.realm, (state.realms[this.realm] as { value?: string }).value);
	}

}