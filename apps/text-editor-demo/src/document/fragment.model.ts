import type { Node } from './types';

export const EmptyFragment = fragment([]);

const fragmentSymbol = Symbol('fragment');

export type Fragment = readonly Node[] & { [fragmentSymbol]: symbol };

export function isFragment(candidate: unknown): candidate is Fragment {
	return candidate !== null && typeof candidate === 'object' && fragmentSymbol in candidate;
}

export function fragment(content: Node[]): Fragment {
	const frag = Array.from(content);
	Object.defineProperty(frag, fragmentSymbol, {
		configurable: false,
		value: fragmentSymbol,
	});
	return frag as unknown as Fragment;
}