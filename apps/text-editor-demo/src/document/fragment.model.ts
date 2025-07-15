import type { BlockNode, TextNode } from './types';

const fragmentSymbol = Symbol('fragment');

export const EmptyFragment = fragment([]) as Fragment<[]>;

export type AnyNode = BlockNode | TextNode /* | InlineNode */;
export type Fragment<content extends readonly AnyNode[] = readonly AnyNode[]> = content & { [fragmentSymbol]: symbol };

export function isFragment(candidate: unknown): candidate is Fragment {
	return candidate !== null && typeof candidate === 'object' && fragmentSymbol in candidate;
}

export function fragment(content: AnyNode[] | Fragment): Fragment {
	if (fragmentSymbol in content) {
		return content;
	}

	const frag = Array.from(content);
	Object.defineProperty(frag, fragmentSymbol, {
		configurable: false,
		value: fragmentSymbol,
	});
	return frag as unknown as Fragment;
}