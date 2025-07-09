import { EmptyFragment, type Fragment } from './fragment.model';
import type { Attributes, Mark, Node, NodeType } from './types';

export class NodeModel implements Node {
	constructor(
		public readonly type: NodeType,
		public readonly attributes: Attributes = {},
		public readonly content: Fragment = EmptyFragment,
		public readonly marks: readonly Mark[] = [],
	) {}


}