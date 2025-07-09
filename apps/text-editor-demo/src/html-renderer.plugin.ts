import { addService, definePlugin, defineService, type Service } from '@xoram/core';
import type { AnyNode, Fragment, NodeKind } from './document-model';

export interface NodeRenderer<renderTo> {
	render(node: AnyNode, renderContent: (fragment: Fragment<AnyNode>) => renderTo): renderTo;
}

export interface NodeRendererService<renderTo> extends Service {
	addRenderer(nodeKind: NodeKind, renderer: NodeRenderer<renderTo>): void;

	render(fragment: Fragment<AnyNode>): renderTo;
}

declare module '@xoram/core' {
	interface ServiceCollection {
		htmlRenderer: NodeRendererService<string>;
	}
}

const htmlRendererService = defineService<NodeRendererService<string>>(() => {

	const renderers = new Map<NodeKind, NodeRenderer<string>>();

	function addRenderer(nodeKind: NodeKind, renderer: NodeRenderer<string>): void {
		renderers.set(nodeKind, renderer);
	}

	function render(fragment: Fragment<AnyNode>): string {
		return fragment.map(node =>
				renderers
					.get(node.kind)
					?.render(node, render))
			.filter(node => node !== undefined)
			.join('');
	}

	return {
		render,
		addRenderer,
	};

});

export const htmlRendererPlugin = definePlugin('renderHTML', () => {
	addService('htmlRenderer', htmlRendererService);
});