/**
 * This script build source typescript files into type declaration files and compile them
 * via api-extractor into:
 *  - a public API rollup file (modulename.public.d.ts)
 *  - an internal API rullup file (modulename.internal.d.ts)
 *  - an api report file (modulename.api.md)
 *  - an api model file (modulename.api.json)
 *
 * If `--preserve-individual-files` is passed the type declaration files will
 * be copied into the `./types` folder, keeping the same file structure as the ./src folder,
 */


import {appendFileSync, cpSync, existsSync, readFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';

import {exec} from './exec.helper.mjs';
import {argv} from 'node:process';
import {readdirSync} from 'fs';

const preserveIndividualFiles = argv.includes('--preserve-individual-files');

const pkg = JSON.parse(readFileSync('package.json', {encoding: 'utf-8'}));

// might lead to issue if we add other targets later...
console.log(`building types ${pkg.name}`);

await exec('vue-tsc', ['--project', 'tsconfig.types.json'], {stdio: 'inherit'});
await exec('api-extractor', ['run', '--local', '--verbose'], {stdio: 'inherit'});


const targets = ['internal', 'public'];
const serviceAugmentationFile = './src/service.ts';
const trimmedPackageName = pkg.name.replace(/@.*?\//, '');
if (existsSync(serviceAugmentationFile)) {
	const data = readFileSync(serviceAugmentationFile, {encoding: 'utf-8'});
	const cleanedUp = data
		.split('\n')
		// this might lead to issues down the road if we expose third party types as services, it'll need to be modified
		// accordingly if that ever happen
		.filter(line => !line.includes('import'))
		.join('\n');

	for (const target of targets) {
		appendFileSync(`./types/${trimmedPackageName}.${target}.d.ts`, cleanedUp);
	}
}

if (preserveIndividualFiles) {
	console.log('copying .d.ts files to ./types');

	readdirSync('./temp/types', {recursive: true, encoding: 'utf-8'})
		.filter(file => file.endsWith('.d.ts'))
		.map(file => [resolve(`./temp/types/${file}`), resolve(`./types/${file}`)])
		.forEach(([source, dest]) => cpSync(source, dest));
}

// cleanup temporary files
rmSync('./temp/types', {recursive: true});
rmSync(`./temp/${trimmedPackageName}.api.md`);
