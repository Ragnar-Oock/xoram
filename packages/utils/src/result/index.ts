/**
 * This module provides a mechanism to encapsulate an operation's result, exposing both the expected return type and
 * the possible errors that might happen
 */

/**
 * Encapsulate the result of an operation that might succeed, returning a `payload` or fail with an `error`.
 * @public
 */
export type Result<payload, error extends Error = Error> = Success<payload> | Failure<error>;
/**
 * Encapsulate a successful operation result.
 * @public
 */
export type Success<payload> = Readonly<{
	ok: true;
	value: payload;
}>;
/**
 * Encapsulate a failed operation's error.
 * @public
 */
export type Failure<error extends Error> = Readonly<{
	ok: false;
	reason: error;
}>
/**
 * Create a success wrapper.
 * @param value the result of the operation
 */
export const success = <payload>(value: payload): Success<payload> => ({ ok: true, value });
/**
 * Create a failure wrapper.
 * @param reason the error that caused the operation to fail
 */
export const failure = <error extends Error>(reason: error): Failure<error> => ({ ok: false, reason });