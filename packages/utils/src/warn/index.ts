/**
 * @internal
 */
export const _warnParams = [
	`%c xoram %c warn %c`,
	'background-color: #2cccdd; color: #333; border-radius: 3px 0 0 3px;',
	'background-color: #ddca2c; color: #333; border-radius: 0 3px 3px 0;',
	'background-color: unset; color: unset;',
];

/**
 * Log a string message or a non-blocking error as a formated warning, this should only be used in blocks surrounded by
 * an env DEV check. Throw the error or message in prod mode to make sure they are caught by the client code error
 * management.
 * @param msgOrError - message or non-blocking error to log
 * @param args - optional additional info to log alongside the message or error
 *
 * @public
 */
export function warn(msgOrError: string | Error, ...args: unknown[]): void {
	console.warn(
		..._warnParams,
		msgOrError,
		...args,
	);
}