/**
 * Does nothing... duh
 */
export function noop(): undefined {
	return undefined;
}

/**
 * Does nothing but return a resolved promises
 */
// eslint-disable-next-line require-await
export async function asyncNoop(): Promise<undefined> {
	return undefined;
}