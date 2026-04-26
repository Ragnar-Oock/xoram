import type { State, Step } from '@xoram/plugin-commander';
import type { Result } from '@xoram/utils/result';
import { failure, success } from '@xoram/utils/result';

export class UnRedoableStep implements Step {

	constructor(
		public readonly realm: string,
		public readonly replacement: string,
		private readonly state: 'do' | 'undo' | 'redo' = 'do',
	) {}

	public apply(state: State): Result<State> {
		const realm = state.realms[this.realm] as { value?: string };
		if (typeof realm?.value !== 'string') {
			return failure(new Error('No setValue realm to write to'));
		}
		if (realm.value === this.replacement) {
			return failure(new Error(`value already set to replacement (${ realm.value })`));
		}
		realm.value = this.replacement;
		return success(state);
	}

	public reverse(state: State): Result<Step> {
		if (this.state !== 'redo') {
			return success(new UnRedoableStep(
				this.realm,
				(state.realms[this.realm] as { value: string }).value,
				this.state === 'do' ? 'undo' : 'redo',
			));
		}
		else {
			return failure(new Error('Step is not reversible'));
		}
	}

}