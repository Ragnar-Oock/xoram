import type { AnyNode, Fragment } from './fragment.model';

export type Attribute = string | { toString(): string };
export type Attributes = Record<string, Attribute>;

export type ContentExpression = string;

export const allMarks = Symbol('allMarks');
export type AllMarks = typeof allMarks;

export const noMarks = Symbol('noMarks');
export type NoMarks = typeof noMarks;

export interface AttributeSpec {
	// eslint-disable-next-line no-explicit-any
	default: any;
}

// TODO figure out how to make this extensible easily
export type RenderResult = unknown;

export interface ParseRule {
	selectors: string[];

	getAttributes(node: Element): Attributes;
}


export type SerializeRule = {
	type: 1;
	name: string;
} | {
	type: 3;
}

export interface NodeParseRule extends ParseRule {
	type: 'node';
	node: NodeType;
}

export interface MarkParseRule extends ParseRule {
	type: 'mark';
	mark: MarkType;
}

export type QualifiedParseRule = NodeParseRule | MarkParseRule;


export interface MarkSpec {
	content: ContentExpression;
	attributes: Record<string, AttributeSpec>;
	render: (node: InlineNode) => RenderResult;
	parse: ParseRule[];
}

export interface NodeSpec {
	content: ContentExpression;
	attributes: Record<string, AttributeSpec>;
	render: (node: BlockNode) => RenderResult;
	parse: ParseRule[];
	serialize: SerializeRule;
	/**
	 * @default AllMarks
	 */
	marks: MarkType['name'][] | AllMarks | NoMarks;
}

export const nodeTypeSymbol = Symbol('nodeType');
export type NodeTypeSymbol = typeof nodeTypeSymbol;

export interface NodeType {
	readonly type: NodeTypeSymbol;
	readonly name: string;
	readonly schema: Schema;
	readonly spec: NodeSpec;
}

export const markTypeSymbol = Symbol('markType');
export type MarkTypeSymbol = typeof markTypeSymbol;

export interface MarkType {
	readonly type: MarkTypeSymbol;
	readonly name: string;
	readonly schema: Schema;
	readonly spec: MarkSpec;
}

export type NodeContent = Fragment | AnyNode | AnyNode[] | string;

export interface Schema {
	readonly nodes: ReadonlyMap<NodeType['name'], NodeType>;
	readonly marks: ReadonlyMap<MarkType['name'], MarkType>;

	whitespace?: 'normal' | 'pre' | 'pre-line';

	node(
		type: NodeType | NodeType['name'],
		content?: NodeContent,
		attributes?: Attributes,
		// marks?: readonly InlineNode[],
	): BlockNode;

	// mark(
	// 	type: MarkType | MarkType['name'],
	// 	content: TextNode,
	// 	attributes?: Attributes,
	// ): InlineNode;

	text(text: string /* marks?: readonly InlineNode[] */): TextNode;

	doc(
		content?: NodeContent,
		attributes?: Attributes,
		// marks?: readonly InlineNode[],
	): BlockNode;

	registerNodeType(name: string, spec: Partial<NodeSpec>): this;

	// registerMarkType(name: string, spec: Partial<MarkSpec>): this;
}

export interface DocNode {
	readonly attributes: Attributes;
	readonly content: Fragment;
}

export interface InlineNode extends DocNode {
	readonly type: MarkType;
}

export interface BlockNode extends DocNode {
	readonly type: NodeType;
	// readonly marks: readonly InlineNode[];
}

export interface TextNode extends BlockNode {
	readonly type: NodeType;
	readonly text: string | undefined;
}