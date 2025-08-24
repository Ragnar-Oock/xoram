import { expect, type MockInstance } from 'vitest';
import { _warnParams } from '../warn';

export function expectPrettyWarn(spy: MockInstance<(...data: any[]) => void>, ...args: any[]): void {
	expect(spy).toHaveBeenCalledWith(..._warnParams, ...args);
}