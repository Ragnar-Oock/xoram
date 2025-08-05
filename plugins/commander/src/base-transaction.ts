import type { Step, Transaction, TransactionStatus } from './commander.service';
import { TransactionError } from './transaction-error';

export class BaseTransaction implements Transaction {
	private readonly _steps: Step[] = [];
	public status: TransactionStatus = 'floating';

	public add(step: Step): this {
		this._steps.push(step);
		return this;
	}

	public get steps(): readonly Step[] {
		return this._steps;
	}

	public apply(): boolean {
		const playedSteps: Step[] = [];
		// play steps
		for (const step of this._steps) {
			try {
				step.apply();
			}
			catch (error) {
				console.error(new TransactionError('Failed to apply transaction', error as Error, this));
			}
			playedSteps.push(step);
		}

		// rollback on fail
		if (playedSteps.length !== this._steps.length) {
			try {
				for (const step of playedSteps.reverse()) {
					step.remove();
				}
			}
			catch (error) {
				throw new TransactionError('Failed to rollback transaction after error', error as Error, this);
			}
			return false;
		}
		
		return true;
	}

	public remove(): boolean {
		for (const step of this._steps.toReversed()) {
			try {
				step.remove();
			}
			catch (error) {
				// throw? log? something else ?
				throw new TransactionError('Failed to remove transaction', error as Error, this);
			}
		}

		return true;
	}
}
