import type { Step, Transaction } from './commander.service';
import { TransactionError } from './transaction-error';

export class BaseTransaction implements Transaction {
	private readonly steps: Step[] = [];

	public add(step: Step): this {
		this.steps.push(step);
		return this;
	}

	public apply(): boolean {
		const playedSteps: Step[] = [];
// play steps
		for (const step of this.steps) {
			try {
				step.apply();
			}
			catch (error) {
				console.error(new TransactionError('Failed to apply transaction', error as Error, this));
			}
			playedSteps.push(step);
		}

		if (playedSteps.length === this.steps.length) {
			return true;
		}

// rollback on fail
		for (const step of playedSteps.reverse()) {
			try {
				step.remove();
			}
			catch (error) {
				throw new TransactionError('Failed to rollback transaction after error', error as Error, this);
			}
		}

		return false;
	}

	public remove(): boolean {
		for (const step of this.steps.toReversed()) {
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
