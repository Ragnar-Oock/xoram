import { addService, definePlugin, defineService, type Service } from '@xoram/core';
import type { AnyNode, Fragment } from './document-model';

declare module '@xoram/core' {
	interface ServiceCollection {
		nodeBuilder: NodeBuilderService;
	}
}

export interface NodeBuilder {
	build(
		element: Node,
		parseNode: (element: Node, context: ParsingContext) => AnyNode | undefined,
		context: ParsingContext,
	): AnyNode | undefined;
}

export interface NodeBuilderService extends Service {
	parse(elements: Node[]): Fragment<AnyNode>;

	addBuilder(nodeName: string, builder: NodeBuilder): undefined;
}

export interface ParsingContext {
	index: number;
}

const nodeBuilderService = defineService<NodeBuilderService>(() => {

	const nodeBuilders = new Map<string, NodeBuilder>();

	function addBuilder(nodeName: string, builder: NodeBuilder): undefined {
		// Todo : prevent overrides ?
		nodeBuilders.set(nodeName, builder);
	}

	function parseNode(element: Node, context: ParsingContext): AnyNode | undefined {
		return nodeBuilders
			.get(element.nodeName.toLowerCase())
			?.build(element, parseNode, context);
	}

	function parse(elements: Node[]): Fragment<AnyNode> {
		const nodes: AnyNode[] = [];

		elements.reduce((index, element) => {
			const node = parseNode(element, { index });

			if (!node) {
				return index;
			}

			nodes.push(node);

			return index + node.length;
		}, 0);

		return nodes
			.filter(node => node !== undefined);
	}

	return {
		addBuilder,
		parse,
	};
});

export const parserPlugin = definePlugin('parse', () => {
	addService('nodeBuilder', nodeBuilderService);
});