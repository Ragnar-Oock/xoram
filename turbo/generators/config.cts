// oxlint-disable no-commonjs
import type { PlopTypes } from '@turbo/gen';
import { exec } from '../../script/exec.helper.mjs';

function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setActionType(
		'runCommand',

		async (answers, { command, comment = '', args = [] }) => {
			const { stdout } = await exec(command, args);
			return comment === '' ? `\u001B[90m${ stdout }\u001B[0m` : `${ comment } :\n\u001B[90m${ stdout }\u001B[0m\n`;
		},
	);
	plop
		.setGenerator('plugin', {
			description: 'Add a new plugin package to the repo.',
			prompts: [
				{
					type: 'input',
					name: 'pluginName',
					message: 'plugin name',
				},
				{
					type: 'input',
					name: 'pluginDescription',
					message: 'plugin description',
					default: '',
				},
				{
					type: 'list',
					name: 'testConfig',
					message: 'configure tests for :',
					choices: [
						{
							name: 'in browser testing',
							value: {
								import: `import { getBrowserTestConfig } from '../../config/vite/vitest.config';`,
								config: 'getBrowserTestConfig(pkg)(env)',
							},
						},
						{
							name: 'node testing',
							value: {
								import: `import { getNodeTestConfig } from '../../config/vite/vitest.config';`,
								config: 'getNodeTestConfig(pkg)(env)',
							},
						},
					],
				},
			],
			actions: [
				{
					type: 'addMany',
					destination: '../../../plugins/{{pluginName}}/',
					base: './plugin',
					templateFiles: './plugin/**',
				},
				{
					type: 'runCommand',
					command: 'yarn',
					comment: 'updating yarn lock',
				},
				{
					type: 'runCommand',
					command: 'git',
					args: [ 'add', '.' ],
					comment: 'adding files to git staging area',
				},
				(answers, config, plop): string => plop.renderString(
					'plugin package created at \u001B[32m./plugins/{{pluginName}}\u001B[0m\n',
					answers,
				),
			],
		});
}

module.exports = generator;