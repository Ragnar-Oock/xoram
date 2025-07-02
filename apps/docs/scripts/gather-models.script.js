import {copyFile, readFile} from 'node:fs/promises';
import {existsSync, mkdirSync, rmSync} from 'node:fs';


const list = await readFile('./scripts/documented-packages.txt', {encoding: 'utf-8'});

const packageDirs = list
	.split('\n')
	.map(line => line.trim())
	.filter(line => !line.startsWith('#'))
	.map(line => {
		const name = line.replace('@xoram/', '');
		const dest = `${name}.api.json`;

		if (line.startsWith('@xoram/plugin-')) {
			return {
				path: `../../plugins/${name.replace('plugin-', '')}/types/${dest}`,
				name,
				dest,
			};
		}
		if (line.startsWith('@xoram/')) {
			return {
				path: `../../packages/${name}/types/${dest}`,
				name,
				dest,
			};
		}

		return false;
	})
	.filter(Boolean);


// clear dist folder
if (existsSync('./models')) {
	rmSync('./models', {recursive: true});
}
mkdirSync('./models');


for (const packageDir of packageDirs) {
	if (!existsSync(packageDir.path)) {
		console.warn(`tried to gather API Model file for ${packageDir.name} but none found (dir: ${packageDir.path})`);
		continue;
	}
	// eslint-disable-next-line no-await-in-loop
	await copyFile(packageDir.path, `./models/${packageDir.dest}`);
}





