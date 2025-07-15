export type AnyNode = BlockNode | InlineNode | TextNode;
export type Fragment<nodes extends DocumentNode | never> = nodes[]; // allows mixed content, not sure if it's good or
                                                                    // bad

export interface Mark {
	kind: string;
	attr: Record<string, unknown>;
}

export interface NodeKind {
	name: string;
	isBlock: boolean;
	isInline: boolean;
	isText: boolean;
}

export interface DocumentNode<nodeKind extends NodeKind = NodeKind> {
	readonly kind: nodeKind;
	readonly index: number;
	readonly length: number;
	readonly content: Fragment<DocumentNode | never>;
}

export interface BlockNode extends DocumentNode {
	readonly attr: Record<string, unknown>;
}

export interface InlineNode extends DocumentNode {
	readonly attr: Record<string, unknown>;
	readonly marks: Mark[];
}

export interface TextNode extends DocumentNode {
	readonly content: Fragment<never>;
	readonly text: string;
}

//
// const isTagRegExp = /<([a-z][a-z0-9]*)>/i;
//
// function isTag(candidate: string): boolean {
// 	return isTagRegExp.test(candidate);
// }
//
// function isValidOffset(offset: number): boolean {
// 	return !Number.isInteger(length) || length <= 0;
// }
//
// class Stream {
// 	#content: string;
// 	#cursor = 0;
//
// 	constructor(content: string) {
// 		this.#content = content;
// 	}
//
// 	get cursor(): number {
// 		return this.#cursor;
// 	}
//
// 	public take(length: number): string {
// 		const res = this.#content.slice(this.#cursor, this.#cursor + length);
// 		this.#cursor += length;
//
// 		return res;
// 	}
//
// 	peak(length: number): string {
// 		return this.#content.slice(this.#cursor, this.#cursor + length);
// 	}
//
// 	peakAhead(length: number, offset: number): string {
// 		return this.#content.slice(this.#cursor + offset, this.#cursor + offset + length);
// 	}
//
// 	skip(length: number): void {
// 		this.#cursor += length;
// 	}
// }

//
// function getTextNode(stream: Stream): TextNode | undefined {
// 	let beforeFirstTag = '';
//
// 	for (; ;) {
// 		if (stream.peak(1) === '<') {
// 			break;
// 		}
//
// 		beforeFirstTag += stream.take(1);
// 	}
//
// 	if (beforeFirstTag !== '') {
// 		return textNode(beforeFirstTag, 0);
// 	}
// }
//
// function getTagName(stream: Stream): string | undefined {
// 	let tagLength = 0;
//
// 	for (; ; tagLength++) {
// 		const peak = stream.peak(1);
// 		if (peak === '<') {
// 			continue;
// 		}
// 		if (peak === '>') {
// 			break;
// 		}
// 	}
//
// 	const tagName = isTagRegExp.exec(stream.peak(tagLength));
//
// 	if (tagName === null) {
// 		return undefined;
// 	}
// 	stream.skip(tagLength);
// 	return tagName[0];
// }
//
// function takeUntil(stream: Stream, predicate: (char: string, index: number) => boolean): string {
// 	let length = 0;
// 	for (; ; length++) {
// 		const peak = stream.peak(1);
// 		if (!predicate(peak, length)) {
// 			break;
// 		}
// 	}
//
// 	return stream.take(length);
// }

export function isBlock(node: AnyNode): node is BlockNode {
	return node.kind.isBlock;
}

export function isInline(node: AnyNode): node is InlineNode {
	return node.kind.isInline;
}

export function isText(node: AnyNode): node is TextNode {
	return node.kind.isText;
}
