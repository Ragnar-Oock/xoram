import { definePlugin, dependsOn, onBeforeCreate } from '@xoram/core';
import type { AnyNode, BlockNode, Fragment, InlineNode, NodeKind } from '../document-model';
import { type NodeBuilder, parserPlugin } from '../dom-parser.plugin';
import { htmlRendererPlugin, type NodeRenderer } from '../html-renderer.plugin';
import { textBuilderPlugin } from './text-builder.plugin';

const paragraphNodeKind: NodeKind = {
	name: 'paragraph',
	isBlock: true,
	isInline: false,
	isText: false,
};
const paragraphBuilder: NodeBuilder = {
	build(element, parseNode, context) {

		const content: AnyNode[] = [];
		Array
			.from(element.childNodes)
			.reduce((acc, child) => {
				const parsed = parseNode(child, { index: acc });

				if (!parsed) { return acc; }

				content.push(parsed);
				return acc + parsed.length;

			}, context.index);

		return {
			kind: paragraphNodeKind,
			attr: {},
			index: context.index,
			content: content as Fragment<BlockNode | InlineNode>,
			get length(): number {
				return content.reduce((acc, child) => acc + child.length, 0);
			},

		} satisfies BlockNode;
	},
};

const paragraphHtmlRenderer: NodeRenderer<string> = {
	render(node: AnyNode, renderContent: (fragment: Fragment<AnyNode>) => string): string {
		return `<p>${ renderContent(node.content) }</p>`;
	},
};

export const paragraphBuilderPlugin = definePlugin('paragraphNode', () => {
	dependsOn(parserPlugin.id);
	dependsOn(htmlRendererPlugin.id);
	dependsOn(textBuilderPlugin.id);
	onBeforeCreate(({ services }) => {
		services.nodeBuilder.addBuilder('p', paragraphBuilder);
		services.htmlRenderer.addRenderer(paragraphNodeKind, paragraphHtmlRenderer);
	});
});