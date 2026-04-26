import type { State } from '../../api/state.service';
import type { Step } from '../../api/step';

export type PropertyPath = [ PropertyKey, ...PropertyKey[] ];

export abstract class _Step implements Step {
	protected constructor(
		protected path: PropertyPath,
	) {}

	public abstract apply(state: State): State;

	public abstract reverse(state: State): Step;

	protected followPath<target = unknown>(state: State, depth = this.path.length): target | undefined {
		return this.path
			.values()
			.take(depth)
			.reduce((target, segment) => (target?.[segment]), state as any);

	}

	protected targetParent<target = unknown>(state: State): target {
		const parent = this.followPath<target>(state, this.path.length - 1);
		if (parent === undefined) {
			throw new TypeError('State has no member at given path');
		}
		return parent;
	}
}