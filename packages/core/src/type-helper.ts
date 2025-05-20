/**
 * Prettify types.
 *
 * Shamelessly stolen from https://timdeschryver.dev/bits/pretty-typescript-types
 *
 * @public
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};