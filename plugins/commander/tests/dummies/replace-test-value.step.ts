import { failure, type Result, success } from '../../src/api/result';
import type { State } from '../../src/api/state.service';
import { type Step } from '../../src/api/step';

export class ReplaceTestValueStep implements Step {

	constructor(
		public readonly realm: string,
		public readonly from: number,
		public readonly to: number,
		public readonly content: string,
	) {}

	public apply(state: State): Result<State> {
		const realm = state.realms[this.realm] as { value?: string };
		if (typeof realm?.value === 'string') {
			const from = this.from < 0 ? realm.value.length + this.from + 1 : this.from;
			const to = this.to < 0 ? realm.value.length + this.to + 1 : this.to;
			realm.value = realm.value.slice(0, from) + this.content + realm.value.slice(to);
			return success(state);
		}
		return failure(new Error('No setValue realm to write to'));
	}

	public reverse(state: State): Step {
		const realm = (state.realms[this.realm] as { value?: string });
		if (realm.value === undefined) {
			throw new TypeError(`Invalid test realm ${ this.realm }, value is undefined`);
		}
		const from = this.from < 0 ? realm.value.length + this.from + 1 : this.from;
		const to = this.to < 0 ? realm.value.length + this.to + 1 : this.to;
		return new ReplaceTestValueStep(
			this.realm,
			from,
			from + this.content.length,
			realm.value.slice(from, to),
		);
	}

}