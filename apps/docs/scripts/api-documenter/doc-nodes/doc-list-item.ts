import { DocNode, DocSection, type IDocNodeParameters } from '@microsoft/tsdoc';

export class DocListItem extends DocNode {
	public readonly content: DocSection;

	constructor(parameters: IDocNodeParameters, sectionChildNodes?: readonly DocNode[]) {
		super(parameters);

		this.content = new DocSection({ configuration: this.configuration }, sectionChildNodes);
	}

	public get kind(): string {
		return 'ListItem';
	}

}