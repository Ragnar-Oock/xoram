import { describe, expectTypeOf, it } from 'vitest';
import { Transaction } from '../../src/core/transaction';

describe('transaction', () => {
	describe('getMeta', () => {
		it('should be strongly typed', () => {
			const transaction = new Transaction([], { testMeta: 'test' });

			const meta = transaction.getMeta('testMeta');
			expectTypeOf(meta).toEqualTypeOf<'test' | undefined>();
		});
	});
});