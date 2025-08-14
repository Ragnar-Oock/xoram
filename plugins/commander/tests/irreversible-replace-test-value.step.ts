import { failure, type Result, success } from '../src/api/result';
import type { State } from '../src/api/state.service';
import { type Step } from '../src/api/step';

export class IrreversibleReplaceTestValueStep implements Step {

	constructor(
		public readonly realm: string,
		public readonly replacement: string,
	) {}

	public apply(state: State): Result<State> {
		const realm = state.realms[this.realm] as { value?: string };
		if (typeof realm?.value !== 'string') {
			return failure(new Error('No test realm to write to'));
		}
		if (realm.value === this.replacement) {
			return failure(new Error(`value already set to replacement (${ realm.value })`));
		}
		realm.value = this.replacement;
		return success(state);
	}

	public reverse(): Step {
		return this;
	}

}