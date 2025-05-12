import { expect, type MockInstance } from 'vitest';
import { warnParams } from '../../src/warn.helper';

export function expectPrettyWarn(spy: MockInstance<(...data: any[]) => void>, ...args: any[]): void {
	expect(spy).toHaveBeenCalledWith(...warnParams, ...args);
}