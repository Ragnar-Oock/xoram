import type { Fragment } from './fragment.model';


export type Attributes = Record<string, unknown>;

export interface NodeType {
	readonly name: string;
	readonly schema: Schema;
}

export interface MarkType {
	readonly name: string;
	readonly schema: Schema;
}

export interface Schema {
	readonly nodes: ReadonlyMap<NodeType['name'], NodeType>;
	readonly marks: ReadonlyMap<MarkType['name'], MarkType>;

	node(
		type: NodeType | NodeType['name'],
		attributes?: Attributes,
		content?: Fragment | Node,
		marks?: readonly Mark[],
	): Node;

	mark(
		type: MarkType | MarkType['name'],
		attributes?: Attributes,
	): Mark;

	text(text: string, marks?: Mark): Node;
}

export interface Mark {
	readonly type: MarkType;
	readonly attributes: Attributes;
}

export interface Node {
	readonly type: NodeType;
	readonly content: Fragment;
	readonly attributes: Attributes;
	readonly marks: readonly Mark[];
}

