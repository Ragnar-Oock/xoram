import { ApiDocumenterCommandLine } from '@microsoft/api-documenter/lib/cli/ApiDocumenterCommandLine.js';
import { BaseAction } from '@microsoft/api-documenter/lib/cli/BaseAction.js';
import { MarkdownDocumenter } from '@microsoft/api-documenter/lib/documenters/MarkdownDocumenter.js';
import XoramDocumenter from './xoram-documenter.ts';

export default class XoramMarkdownAction extends BaseAction {
	// oxlint-disable-next-line no-unused-vars
	public constructor(parser: ApiDocumenterCommandLine) {
		super({
			actionName: 'xoram-markdown',
			summary: 'Generate documentation as Markdown files (*.md) using a xoram\'s custom template',
			documentation:
				'Generates API documentation as a collection of files in' +
				' Markdown format, suitable for example for publishing on a GitHub site.',
		});
	}

	// oxlint-disable-next-line require-await
	protected override async onExecuteAsync(): Promise<void> {
		const { apiModel, outputFolder } = this.buildApiModel();

		const markdownDocumenter: MarkdownDocumenter = new XoramDocumenter({
			apiModel,
			documenterConfig: undefined,
			outputFolder,
		});
		markdownDocumenter.generateFiles();
	}
}