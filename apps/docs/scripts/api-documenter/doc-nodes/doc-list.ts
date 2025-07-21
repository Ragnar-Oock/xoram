import { DocNode, type IDocNodeParameters } from '@microsoft/tsdoc';
import { DocListItem } from './doc-list-item.ts';

export interface DocListParameters extends IDocNodeParameters {
	ordered?: boolean;
}

export class DocList extends DocNode {
	private readonly _items: DocListItem[];
	private readonly _isOrdered: boolean;

	constructor(parameters: DocListParameters, items?: readonly DocListItem[]) {
		super(parameters);

		this._isOrdered = parameters.ordered ?? false;

		this._items = [];
		items?.forEach(item => this.addItem(item));
	}

	public addItem(item: DocListItem): void {
		this._items.push(item);
	}

	public get items(): readonly DocListItem[] {
		return this._items;
	}

	/** @override */
	protected onGetChildNodes(): readonly (DocNode | undefined)[] {
		return this._items;
	}

	/** @override */
	public get kind(): string {
		return this._isOrdered ? 'OrderedList' : 'UnorderedList';
	}

}