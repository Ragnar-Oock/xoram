export type PackageJSON = {
	name: string,
	dependencies?: Record<string, string>,
}

export function unscope(name: string): string {
	return name.replace(/@.+\//, '');
}