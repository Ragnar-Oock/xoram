import { type PathLike, readdirSync } from 'fs';


export const getDirectories = (path: PathLike): string[] =>
	readdirSync(path, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);