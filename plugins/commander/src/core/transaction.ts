import { failure, type Result, success } from '../api/result';
import type { State } from '../api/state.service';
import { type Step } from '../api/step';
import type { Transaction as TransactionInterface } from '../api/transaction';
import { TransactionError } from '../api/transaction-error';

export class Transaction implements TransactionInterface {
	constructor(private readonly _steps: Step[] = []) {}

	public add(step: Step): this {
		this._steps.push(step);
		return this;
	}

	public get steps(): readonly Step[] {
		return this._steps;
	}

	public apply(state: State): Result<Transaction, TransactionError> {
		const reversedSteps: Step[] = [];
		let applyError: TransactionError | undefined;
		// play steps
		for (const step of this._steps) {
			const reversed = step.reverse(state);
			const result = step.apply(state);

			if (!result.ok) {
				applyError = new TransactionError('Failed to apply transaction', result.reason as Error, this);
				break;
			}

			reversedSteps.push(reversed);
		}

		// rollback on fail
		if (applyError) {
			// we don't provide safeguards if the rollback fails
			for (const step of reversedSteps.reverse()) {
				step.apply(state);
			}
			return failure(applyError);
		}

		return success(new Transaction(reversedSteps.reverse()));
	}

	public reverse(state: State): TransactionInterface {
		return new Transaction(this._steps.map(step => step.reverse(state)));
	}
}
