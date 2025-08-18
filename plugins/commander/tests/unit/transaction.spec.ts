import { describe, expect, it, vi } from 'vitest';
import type { State, TransactionMeta } from '../../src';
import { Transaction } from '../../src/core/transaction';
import { ReplaceTestValueStep } from '../dummies/replace-test-value.step';

declare module '../../src' {
	interface TransactionMeta {
		testMeta: 'test';
	}
}

const getMockState = (): State => ({ realms: { test: { value: '' } } });

describe('transaction', () => {
	describe('add', () => {
		it('should add the given step at the end of the step array', () => {
			const fistStep = new ReplaceTestValueStep('test', 0, -1, 'hello');
			const secondStep = new ReplaceTestValueStep('test', 0, -1, 'world');

			const transaction = new Transaction([ fistStep ]);

			transaction.add(secondStep);

			expect(transaction.steps).toStrictEqual([ fistStep, secondStep ]);
		});
	});
	describe('steps', () => {
		it('should return the transaction\'s step array', () => {
			const fistStep = new ReplaceTestValueStep('test', 0, -1, 'hello');

			const transaction = new Transaction([ fistStep ]);

			expect(transaction.steps).toStrictEqual([ fistStep ]);
		});
	});

	describe('reverse', () => {
		it('should return a new transaction', () => {
			const transaction = new Transaction();
			const state = getMockState();

			const reversed = transaction.reverse(state);
			expect(reversed).not.toBe(transaction);
			expect(reversed).toBeInstanceOf(Transaction); // this might not be ideal
		});
		it('should invoke the steps reverse method', () => {
			const step = new ReplaceTestValueStep('test', 0, -1, 'hello');
			const spy = vi.spyOn(step, 'reverse');
			const state = getMockState();
			const transaction = new Transaction([ step ]);

			transaction.reverse(state);

			expect(spy).toHaveBeenCalledExactlyOnceWith(state);
		});
	});

	describe('setMeta', () => {
		it('should return the transaction', () => {
			const transaction = new Transaction();

			expect(transaction.setMeta('testMeta', 'test')).toBe(transaction);
		});
		it('should set the meta to the given value', () => {
			const meta: Partial<TransactionMeta> = {};
			const transaction = new Transaction([], meta);

			transaction.setMeta('testMeta', 'test');

			expect(meta.testMeta).toBe('test');
		});
	});
	describe('getMeta', () => {
		it('should return undefined when the meta is not set', () => {
			const transaction = new Transaction();

			expect(transaction.getMeta('testMeta')).toBe(undefined);
		});
		it('should return the last set value', () => {
			const transaction = new Transaction([], { testMeta: 'test' });
			expect(transaction.getMeta('testMeta')).toBe('test');
		});
	});
});