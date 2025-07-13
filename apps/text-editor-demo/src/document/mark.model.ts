import type { Attributes, InlineNode, MarkType, TextNode } from './types';

export function mark({
	type, attributes = {}, content,
}: {
	type: MarkType,
	attributes?: Attributes,
	content: TextNode,
}): InlineNode {
	return {
		type,
		attributes,
		content,
	};
}