import { addService, definePlugin, defineService, type Service } from '@xoram/core';
import type { AnyNode, DocumentNode, NodeKind } from './document-model';

declare module '@xoram/core' {
	interface ServiceCollection {
		domRenderer: NodeRendererService<Node>;
	}
}

export interface NodeRenderer<node extends NodeKind, renderTo> {
	render(node: DocumentNode<node>, renderContent: (node: AnyNode) => renderTo): renderTo;
}

export interface NodeRendererService<renderTo> extends Service {
	addRenderer<node extends NodeKind>(nodeKind: node, renderer: NodeRenderer<node, renderTo>): void;

	render(node: AnyNode): renderTo;
}

const domRendererService = defineService<NodeRendererService<Node>>(() => {

	const renderers = new Map<NodeKind, NodeRenderer<NodeKind, Node>>();

	function addRenderer(nodeKind: NodeKind, renderer: NodeRenderer<NodeKind, Node>): void {
		renderers.set(nodeKind, renderer);
	}

	function renderNode(node: AnyNode): Node | undefined {
		const rendered = renderers
			.get(node.kind)
			?.render(node, render);
		if (rendered) {
			// @ts-expect-error __doc is made up
			rendered.__doc = node;
		}
		return rendered;
	}

	function render(node: AnyNode): Node {
		return renderNode(node) ?? new Comment('invalid doc');
	}

	return {
		render,
		addRenderer,
	};

});

export const domRendererPlugin = definePlugin('renderDOM', () => {
	addService('domRenderer', domRendererService);
});