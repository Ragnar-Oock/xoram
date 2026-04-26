import { failure, fromCall, type Result, success } from '@xoram/utils/result';
import type { State } from '../api/state.service';
import { type Step } from '../api/step';
import type { Transaction as TransactionInterface, TransactionMeta } from '../api/transaction';
import { TransactionError } from '../api/transaction-error';

export class Transaction implements TransactionInterface {
	constructor(
		private readonly _steps: Step[] = [],
		private readonly _meta: Partial<TransactionMeta> = {},
	) {}

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
			const reversed = fromCall(() => step.reverse(state));
			if (!reversed.ok) {
				applyError = new TransactionError('Failed to create reverse step', reversed.reason, this);
				break;
			}
			const applied = fromCall(() => step.apply(state));

			if (!applied.ok) {
				applyError = new TransactionError('Failed to apply transaction', applied.reason as Error, this);
				break;
			}

			reversedSteps.push(reversed.value);
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

	public reverse(state: State): Result<Transaction, TransactionError> {
		const steps = fromCall(() => this._steps.map(step => step.reverse(state)));
		if (!steps.ok) {
			return failure(new TransactionError('Unable to invert transaction', steps.reason, this));
		}
		return success(new Transaction(steps.value));
	}

	public getMeta<meta extends keyof TransactionMeta>(name: meta): TransactionMeta[meta] | undefined {
		return this._meta[name];
	}

	public setMeta<meta extends keyof TransactionMeta>(name: meta, value: TransactionMeta[meta]): this {
		this._meta[name] = value;
		return this;
	}
}
