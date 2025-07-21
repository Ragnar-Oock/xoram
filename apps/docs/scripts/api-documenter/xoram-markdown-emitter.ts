import { CustomMarkdownEmitter } from '@microsoft/api-documenter/lib/markdown/CustomMarkdownEmitter.js';
import type { IMarkdownEmitterContext } from '@microsoft/api-documenter/lib/markdown/MarkdownEmitter.js';
import { DocNode } from '@microsoft/tsdoc';

export class XoramMarkdownEmitter extends CustomMarkdownEmitter {
	protected writeNode(docNode: DocNode, context: IMarkdownEmitterContext, docNodeSiblings: boolean): void {
		// try {
		super.writeNode(docNode, context, docNodeSiblings);
		// }
		// catch (error) {
		// 	console.error(error);
		// }

	}
}