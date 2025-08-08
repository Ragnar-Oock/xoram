export type Result<payload, error extends Error = Error> = Success<payload> | Failure<error>;
export type Success<payload> = Readonly<{
	ok: true;
	value: payload;
}>;
export type Failure<error extends Error> = Readonly<{
	ok: false;
	reason: error;
}>
export const success = <payload>(value: payload): Success<payload> => ({ ok: true, value });
export const failure = <error extends Error>(reason: error): Failure<error> => ({ ok: false, reason });