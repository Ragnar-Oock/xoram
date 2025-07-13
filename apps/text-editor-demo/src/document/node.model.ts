import { EmptyFragment, type Fragment } from './fragment.model';
import type { Attributes, BlockNode, NodeType, TextNode } from './types';

export function node(node: {
	type: NodeType,
	attributes?: Attributes,
	content?: Fragment,
	// marks?: readonly InlineNode[]
}): BlockNode;
export function node(node: {
	type: NodeType,
	attributes?: Attributes,
	// marks?: readonly InlineNode[],
	text: string
}): TextNode;
export function node({
	type,
	attributes = {},
	content = EmptyFragment,
	// marks = [],
	text,
}: {
	type: NodeType,
	attributes?: Attributes,
	content?: Fragment,
	// marks?: readonly InlineNode[],
	text?: string | undefined,
}): BlockNode | TextNode {
	return {
		type,
		attributes,
		content,
		// marks,
		text,
	};
}

export function isNode(candidate: unknown): candidate is BlockNode {
	return (
		candidate !== null
		&& typeof candidate === 'object'
		&& isNodeType(candidate.type)
		&& typeof candidate.attributes === 'object'
		// && Array.isArray(candidate.marks)
		&& 'text' in candidate
	);
}

export function isNodeType(candidate: unknown): candidate is NodeType {
	return (
		candidate !== null
		&& typeof candidate === 'object'
		&& typeof candidate.name === 'string'
		&& candidate.schema !== null
		&& typeof candidate.schema === 'object'
		&& candidate.spec !== null
		&& typeof candidate.spec === 'object'
	);
}