import type { Result } from './result';
import type { State } from './state.service';

/**
 * @todo add serialization/deserialization api
 */
export interface Step {
	/**
	 * Execute the steps action. This method's action **MUST** only be impacted by the content of the given state,
	 * it **MUST** not use any outside state, it **CAN** mutate the passed state.
	 */
	apply: (state: State) => Result<State>;

	/**
	 * Create a step that does the opposite action.
	 */
	reverse: () => Step;
}
