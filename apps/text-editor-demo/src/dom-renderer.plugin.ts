import { addService, definePlugin, defineService } from '@xoram/core';
import type { AnyNode, Fragment, NodeKind } from './document-model';
import type { NodeRenderer, NodeRendererService } from './html-renderer.plugin';

declare module '@xoram/core' {
	interface ServiceCollection {
		domRenderer: NodeRendererService<Node[]>;
	}
}

const domRendererService = defineService<NodeRendererService<Node[]>>(() => {

	const renderers = new Map<NodeKind, NodeRenderer<Node[]>>();

	function addRenderer(nodeKind: NodeKind, renderer: NodeRenderer<Node[]>): void {
		renderers.set(nodeKind, renderer);
	}

	function render(fragment: Fragment<AnyNode>): Node[] {
		return fragment.flatMap(node =>
				renderers
					.get(node.kind)
					?.render(node, render))
			.filter(node => node !== undefined);
	}

	return {
		render,
		addRenderer,
	};

});

export const domRendererPlugin = definePlugin('renderDOM', () => {
	addService('domRenderer', domRendererService);
});