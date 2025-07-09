import { EmptyFragment, fragment, type Fragment, isFragment } from './fragment.model';
import { MarkModel } from './mark.model';
import { NodeModel } from './node.model';
import type { Attributes, Mark, MarkType, Node, NodeType, Schema } from './types';

export class SchemaModel implements Schema {
	public readonly marks = new Map<string, MarkType>();
	public readonly nodes = new Map<string, NodeType>();

	public mark(type: string | MarkType, attributes?: Attributes): Mark {
		const resolvedType = typeof type === 'string' ? this.marks.get(type) : type;
		if (!resolvedType) {
			// todo find a way to fallback instead of throwing
			throw new TypeError(`unknown mark type : ${ typeof type === 'string' ? type : type.name }`);
		}
		return new MarkModel(resolvedType, attributes);
	}

	public node(
		type: string | NodeType,
		attributes?: Attributes,
		content?: Fragment | Node,
		marks?: readonly Mark[],
	): Node {
		const resolvedType = typeof type === 'string' ? this.nodes.get(type) : type;
		if (!resolvedType) {
			// todo find a way to fallback instead of throwing
			throw new TypeError(`unknown node type : ${ typeof type === 'string' ? type : type.name }`);
		}

		let resolvedContent: Fragment;
		if (isFragment(content)) {
			resolvedContent = content;
		}
		else if (content) {
			resolvedContent = fragment([ content ]);
		}
		else {
			resolvedContent = EmptyFragment;
		}

		return new NodeModel(resolvedType, attributes, resolvedContent, marks);
	}

	public text(text: string, marks?: Mark): Node {
		throw new Error('not implemented');
	}

}