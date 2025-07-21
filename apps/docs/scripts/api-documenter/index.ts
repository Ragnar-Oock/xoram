import { ApiDocumenterCommandLine } from '@microsoft/api-documenter/lib/cli/ApiDocumenterCommandLine.js';
import XoramMarkdownAction from './xoram-markdown-action.ts';

const commandLine = new ApiDocumenterCommandLine();

commandLine.addAction(new XoramMarkdownAction(commandLine));

commandLine
	.executeAsync()
	.catch(console.error); // CommandLineParser.executeAsync() should never reject the promise
