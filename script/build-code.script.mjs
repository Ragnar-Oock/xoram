import {existsSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import {exec} from './exec.helper.mjs';


// clear dist folder
if (existsSync('./dist')) {
	rmSync('./dist', {recursive: true});
	mkdirSync('./dist');
}

const pkg = JSON.parse(readFileSync('package.json', {encoding: 'utf-8'}));

const targets = [
	'dev',
	'prod',
];

for (const target of targets) {
	// might lead to issue if we add other targets later...
	console.log(`building ${pkg.name}, target : ${target}`);
	// eslint-disable-next-line no-await-in-loop
	await exec('yarn', [`build:code:${target}`], {stdio: 'inherit'});
	console.log('-----');
}

