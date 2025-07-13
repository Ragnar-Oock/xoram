import { EmptyFragment, fragment, type Fragment, isFragment } from './fragment.model';
import { isNode, node } from './node.model';
import {
	allMarks,
	type Attributes,
	type BlockNode,
	type MarkType,
	type NodeContent,
	type NodeSpec,
	type NodeType,
	nodeTypeSymbol,
	type Schema,
	type TextNode,
} from './types';

interface SchemaSpec {
	rootType: string;
}

export class SchemaModel implements Schema {
	public readonly marks = new Map<string, MarkType>();
	public readonly nodes = new Map<string, NodeType>();

	readonly #rootType: string;

	constructor(spec: Partial<SchemaSpec> = {}) {
		this.#rootType = spec.rootType ?? 'doc';
	}

	// public mark(type: string | MarkType, content: TextNode, attributes?: Attributes): InlineNode {
	// 	const resolvedType = typeof type === 'string' ? this.marks.get(type) : type;
	// 	if (!resolvedType) {
	// 		// todo find a way to fallback instead of throwing
	// 		throw new TypeError(`unknown mark type : ${ typeof type === 'string' ? type : type.name }`);
	// 	}
	// 	return mark({
	// 		type: resolvedType,
	// 		attributes,
	// 		content,
	// 	});
	// }

	public node(
		type: string | NodeType,
		content?: NodeContent,
		attributes?: Attributes,
		// marks?: readonly InlineNode[],
	): BlockNode {
		const resolvedType = typeof type === 'string' ? this.nodes.get(type) : type;
		if (!resolvedType) {
			// todo find a way to fallback instead of throwing
			throw new TypeError(`unknown node type : ${ typeof type === 'string' ? type : type.name }`);
		}

		return node({
			type: resolvedType,
			attributes,
			content: this.contentToFragment(content),
			// marks,
		});
	}

	private contentToFragment(content?: NodeContent): Fragment {
		if (typeof content === 'string') {
			return fragment([ this.text(content) ]);
		}
		if (isFragment(content)) {
			return content;
		}
		if (Array.isArray(content)) {
			return fragment(content);
		}

		if (isNode(content)) {
			return fragment([ content ]);
		}

		return EmptyFragment;
	}

	public text(text: string /* marks?: readonly InlineNode[] */): TextNode {
		const type = this.nodes.get('text');
		if (!type) {
			// todo make this impossible, it's silly
			throw new TypeError('no text type defined');
		}
		return node({
			type,
			text,
			// marks,
		});
	}

	public registerNodeType(name: string, spec: Partial<NodeSpec>): this {

		if (this.nodes.has(name)) {
			// todo should this throw ?
			throw new Error(`NodeType named ${ name } already exists, aborting.`);
		}

		this.nodes.set(name, {
			schema: this,
			spec: toQualifiedNodeSpec(spec),
			name,
			type: nodeTypeSymbol,
		});

		return this;
	}

	// public registerMarkType(name: string, spec: Partial<MarkSpec>): this {
	// 	if (this.marks.has(name)) {
	// 		// todo should this throw ?
	// 		throw new Error(`MarkType named ${ name } already exists, aborting.`);
	// 	}
	//
	// 	this.marks.set(name, {
	// 		schema: this,
	// 		spec: toQualifiedMarkSpec(spec),
	// 		name,
	// 		type: markTypeSymbol,
	// 	});
	//
	// 	return this;
	// }

	public doc(
		content?: NodeContent,
		attributes?: Attributes,
		// marks?: readonly InlineNode[],
	): BlockNode {
		return this.node(this.#rootType, content, attributes/* , marks */);
	}
}


// todo what should this do ?
function defaultRenderer(): void { return; }

function toQualifiedNodeSpec(spec: Partial<NodeSpec>): NodeSpec {
	return {
		content: spec.content ?? '',
		marks: spec.marks ?? allMarks,
		attributes: spec.attributes ?? {},
		render: spec.render ?? defaultRenderer,
		parse: spec.parse ?? [],
	};
}

//
// function toQualifiedMarkSpec(spec: Partial<MarkSpec>): MarkSpec {
// 	return {
// 		attributes: spec.attributes ?? {},
// 		render: spec.render ?? defaultRenderer,
// 		parse: [],
// 	};
// }