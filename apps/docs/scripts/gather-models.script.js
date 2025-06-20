import { copyFile, readFile } from 'node:fs/promises';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

const list = await readFile('./scripts/documented-packages.txt', { encoding: 'utf-8' });

const packageDirs = list
	.split('\n')
	.map(line => line.trim())
	.filter(line => !line.startsWith('#'))
	.map(line => {
		if (line.startsWith('@zoram/')) {
			return {
				dir: 'packages',
				name: line.replace('@zoram/', ''),
			};
		}
		if (line.startsWith('@zoram-plugin/')) {
			return {
				dir: 'plugins',
				name: line.replace('@zoram-plugin/', ''),
			};
		}

		return false;
	})
	.filter(Boolean);


// clear dist folder
if (existsSync('./models')) {
	rmSync('./models', { recursive: true });
	mkdirSync('./models');
}


for (const packageDir of packageDirs) {
	const src = `../../${packageDir.dir}/${packageDir.name}/types/${packageDir.name}.api.json`;
	const dest = `./models/${packageDir.name}.api.json`;

	if (!existsSync(src)) {
		console.warn(`tried to gather API Model file for ${packageDir.name} but none found`);
		continue;
	}
	// eslint-disable-next-line no-await-in-loop
	await copyFile(src, dest);
}





