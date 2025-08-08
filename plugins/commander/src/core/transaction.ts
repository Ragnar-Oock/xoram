import { failure, type Result, success } from '../api/result';
import type { State } from '../api/state.service';
import { type Step } from '../api/step';
import type { Transaction as TransactionInterface } from '../api/transaction';
import { TransactionError } from '../api/transaction-error';

export class Transaction implements TransactionInterface {
	private readonly _steps: Step[] = [];

	public add(step: Step): this {
		this._steps.push(step);
		return this;
	}

	public get steps(): readonly Step[] {
		return this._steps;
	}

	public apply(state: State): Result<undefined, TransactionError> {
		const playedSteps: Step[] = [];
		let applyError: TransactionError | undefined;
		// play steps
		for (const step of this._steps) {
			const result = step.apply(state);

			if (!result.ok) {
				applyError = new TransactionError('Failed to apply transaction', result.reason as Error, this);
				break;
			}

			playedSteps.push(step);
		}

		// rollback on fail
		if (applyError) {
			// we don't provide safeguards if the rollback fails
			for (const step of playedSteps.reverse()) {
				step.reverse().apply(state);
			}
			return failure(applyError);
		}

		// oxlint-disable-next-line no-useless-undefined
		return success(undefined);
	}

	public reverse(): TransactionInterface {
		return this._steps.reduce(
			(transaction, step) => transaction.add(step.reverse()),
			new Transaction(),
		);
	}
}
