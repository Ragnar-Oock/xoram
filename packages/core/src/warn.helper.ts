/**
 * @internal
 */
export const warnParams = [
	`%c xoram %c warn %c`,
	'background-color: #2cccdd; color: #333; border-radius: 3px 0 0 3px;',
	'background-color: #ddca2c; color: #333; border-radius: 0 3px 3px 0;',
	'background-color: unset; color: unset;',
];

/**
 * Log a string message or a non-blocking error as a warning in dev.
 * @param msgOrError message or non-blocking error to log
 * @param args optional additional info to log alongside the message or error
 *
 * @internal
 */
export function warn(msgOrError: string | Error, ...args: unknown[]): void {
	console.warn(
		...warnParams,
		msgOrError,
		...args,
	);
}