import type { Attributes, BlockNode, MarkParseRule, NodeContent, NodeParseRule, Schema } from './types';

export interface Parser {
	parse: (input: string) => BlockNode;
}

function* merge<T, U>(iterator1: IterableIterator<T>, iterator2: IterableIterator<U>): Generator<T | U> {
	yield* iterator1;
	yield* iterator2;
}

export class ParserModel implements Parser {
	readonly #domParser: DOMParser;

	readonly #schema: Schema;

	/**
	 * @param schema the schema the parser will work with
	 * @param domParser the parser to convert strings into DOM nodes
	 */
	constructor(schema: Schema, domParser: DOMParser) {
		this.#schema = schema;
		this.#domParser = domParser;
	}

	private get nodeRules(): IteratorObject<NodeParseRule> {
		return this.#schema.nodes
			.values()
			.flatMap(nodeType =>
				nodeType.spec.parse
					.values()
					.map(rule => ({
						node: nodeType,
						type: 'node',
						...rule,
					}) satisfies NodeParseRule),
			);
	}

	private get markRules(): IteratorObject<MarkParseRule> {
		return this.#schema.marks
			.values()
			.flatMap(markType =>
				markType.spec.parse
					.values()
					.map(rule => ({
						mark: markType,
						type: 'mark',
						...rule,
					}) satisfies MarkParseRule),
			);
	}

	parse(input: string | NodeList): BlockNode {
		const domNodes = typeof input === 'string' ? this.#domParser
			.parseFromString(input, 'text/html')
			.body.childNodes : input;

		const nodes = this.parseDOM(domNodes);

		return this.#schema.doc(nodes);
	}

	private parseDOM(nodes: NodeList/* , options?: {
	 allowed?: ContentExpression
	 } */): NodeContent {
		return nodes
			.values()
			// eslint-disable-next-line array-callback-return
			.map(node => {
				switch (node.nodeType) {
					case node.ELEMENT_NODE: {
						return this.parseNode(node as Element);
					}
					case node.TEXT_NODE: {
						return this.parseText(node as Text);
					}
				}
			})
			.filter(maybeNode => maybeNode !== undefined)
			// .filter(nodeOrMark => matchContentExpression(nodeOrMark, options?.allowed ?? '*'))
			.toArray();
	}

	private parseNode(node: Element): BlockNode | /* InlineNode | */ undefined {
		console.log(this.nodeRules.toArray());
		const rule = this.nodeRules
			.find(rule =>
				rule.selectors.some(selector =>
					node.matches(selector),
				),
			);


		switch (rule?.type) {
			case 'node': {
				return this.#schema.node(
					rule.node,
					this.parseDOM(node.childNodes),
					this.parseAttributes(node, rule),
					// this.parseMark(node),
				);
			}

			// case 'mark': {
			// 	return this.schema.mark(
			// 		rule.mark,
			// 		this.parseDOM(node.childNodes),
			// 		this.parseAttributes(node, rule),
			// 	);
			// }
		}
	}

	private parseText(node: Text): BlockNode | undefined {
		let text = node.textContent;
		if (text === null) {
			return;
		}
		switch (this.#schema.whitespace) {
			case 'pre': {
				text = text
					.replaceAll('\n', '');
				break;
			}

			case 'pre-line': {
				text = text
					.replaceAll(/\s+/g, '');
				break;
			}

			default: {
				text = text
					.replaceAll(/(\s|\n)+/g, ' ');
				break;
			}
		}
		if (text.length === 0 || text === ' ') {
			// todo deal with whitespace only nodes ?
			return;
		}

		return this.#schema.text(text.replaceAll('\n', ''));
	}

	private parseAttributes(node: Element, rule: NodeParseRule): Attributes {
		return rule.getAttributes(node);
	}
}
