import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import type { AnyNode, NodeKind, TextNode } from '../document-model';
import { type NodeBuilder, parserPlugin } from '../dom-parser.plugin';
import type { NodeRenderer } from '../html-renderer.plugin';

const textNodeKind: NodeKind = {
	name: 'text',
	isBlock: false,
	isInline: false,
	isText: true,
};
const textBuilder: NodeBuilder = {
	build(element, _, context) {
		const text = element.textContent;

		if (text === null) {
			return;
		}

		return {
			kind: textNodeKind,
			text: text,
			content: [],
			index: context.index,
			get length(): number {
				return text.length;
			},
		} satisfies TextNode;
	},
};

const textHtmlRenderer: NodeRenderer<string> = {
	render(node: AnyNode): string {
		if (node.kind.isText) {
			return (node as TextNode).text;
		}
		return '';
	},
};

export const textBuilderPlugin = definePlugin('textNode', () => {
	dependsOn(parserPlugin.id);
	onBeforeCreate(({ services }) => {
		services.nodeBuilder.addBuilder('#text', textBuilder);
		services.htmlRenderer.addRenderer(textNodeKind, textHtmlRenderer);
	});
});