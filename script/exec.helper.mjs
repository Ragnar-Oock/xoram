import {spawn} from 'node:child_process';

/**
 * run command in sub process, stolen from Vue's build scripts
 *
 * @param {string} command the command to execute in the child process
 * @param {string[]} args args to pass to the command
 * @param {object} [options] options to pass to the child process
 */
// eslint-disable-next-line require-await
export async function exec(command, args, options) {
	// eslint-disable-next-line avoid-new
	return new Promise((resolve, reject) => {
		const _process = spawn(command, args, {
			stdio: [
				'ignore', // stdin
				'pipe', // stdout
				'pipe', // stderr
			],
			...options,
			shell: process.platform === 'win32',
		});

		/**
		 * @type {Buffer[]}
		 */
		const stderrChunks = [];
		/**
		 * @type {Buffer[]}
		 */
		const stdoutChunks = [];

		_process.stderr?.on('data', chunk => {
			stderrChunks.push(chunk);
		});

		_process.stdout?.on('data', chunk => {
			stdoutChunks.push(chunk);
		});

		_process.on('error', error => {
			reject(error);
		});

		_process.on('exit', code => {
			const ok = code === 0;
			const stderr = Buffer.concat(stderrChunks).toString().trim();
			const stdout = Buffer.concat(stdoutChunks).toString().trim();

			if (ok) {
				const result = {ok, code, stderr, stdout};
				resolve(result);
			} else {
				reject(
					new Error(
						`Failed to execute command: ${command} ${args.join(' ')}: ${stderr}`,
					),
				);
			}
		});
	});
}