import { expect, type MockInstance } from 'vitest';


// todo merge with implementation in @xoram/core
export function expectPrettyWarn(spy: MockInstance<(...data: unknown[]) => void>, ...args: unknown[]): void {
	expect(spy).toHaveBeenCalledWith(
		expect.stringContaining('xoram'),
		expect.stringContaining(':'),
		expect.stringContaining(':'),
		expect.stringContaining(':'),
		...args,
	);
}