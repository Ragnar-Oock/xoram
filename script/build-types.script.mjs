import {appendFileSync, existsSync, readFileSync, rmSync} from 'node:fs';
import {exec} from './exec.helper.mjs';

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

// cleanup temporary files
rmSync('./temp/types', {recursive: true});
rmSync(`./temp/${trimmedPackageName}.api.md`);
