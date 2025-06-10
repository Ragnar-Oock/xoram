import { expect, type MockInstance } from 'vitest';


// todo merge with implementation in @zoram/core
export function expectPrettyWarn(spy: MockInstance<(...data: unknown[]) => void>, ...args: unknown[]): void {
	expect(spy).toHaveBeenCalledWith(
		expect.stringContaining('zoram'),
		expect.stringContaining(':'),
		expect.stringContaining(':'),
		expect.stringContaining(':'),
		...args,
	);
}