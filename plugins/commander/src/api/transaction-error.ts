import type { Transaction } from './transaction';


export class TransactionError extends Error {
	public transaction: Transaction;

	constructor(msg: string, cause: Error, transaction: Transaction) {
		super(msg, cause);
		this.transaction = transaction;
	}
}
