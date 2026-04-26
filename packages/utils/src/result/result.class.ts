export type Failure<E> = {
	ok: false;
	value: E;
};

export type Success<T> = {
	ok: true;
	value: T;
};

export interface Result<payload, error> {
	readonly isSuccess: boolean;
	readonly isFailure: boolean;

	map<result>(fn: (value: payload) => result): Result<result, error>;

	flatMap<result>(fn: (value: payload) => Result<result, error>): Result<result, error>;

	match<result>(cases: { failed: (value: error) => result; succeeded: (value: payload) => result }): result;

	getOrElse(defaultValue: payload): payload;

	failed<result, _error = unknown>(fn: (value: error) => result): Result<result, _error> | Result<payload, error>;

	succeeded<result, _error = unknown>(fn: (value: payload) => result): Result<result, _error> | Result<payload, error>;
}

class ResultClass<payload, error> implements Result<payload, error> {
	constructor(private readonly _value: Failure<error> | Success<payload>) {}

	get isSuccess(): boolean {
		return this._value.ok;
	}

	get isFailure(): boolean {
		return !this._value.ok;
	}

	map<result>(fn: (value: payload) => result): Result<result, error> {
		if (this._value.ok) {
			return success(fn(this._value.value));
		}
		return failure(this._value.value);
	}

	flatMap<result>(fn: (value: payload) => Result<result, error>): Result<result, error> {
		if (this._value.ok) {
			return fn(this._value.value);
		}
		return failure(this._value.value);
	}

	getOrElse(defaultValue: payload): payload {
		if (this._value.ok) {
			return this._value.value;
		}
		return defaultValue;
	}

	failed<result, _error = unknown>(fn: (value: error) => result): Result<result, _error> | Result<payload, error> {
		return this._value.ok
			? this
			: fromTry<result, _error>(() => fn(this._value.value as error));
	}

	succeeded<result, _error = unknown>(fn: (value: payload) => result): Result<result, _error> | Result<payload, error> {
		return this._value.ok
			? fromTry<result, _error>(() => fn(this._value.value as payload))
			: this;
	}

	match<result>({ failed, succeeded }: {
		failed: (value: error) => result;
		succeeded: (value: payload) => result
	}): result {
		return !this._value.ok
			? failed(this._value.value)
			: succeeded(this._value.value);
	}
}

export const success = <payload, error>(value: payload): Result<payload, error> => new ResultClass<payload, error>({
	ok: true,
	value,
});
export const failure = <payload, error>(value: error): Result<payload, error> => new ResultClass<payload, error>({
	ok: false,
	value,
});

export const fromTry = <payload, error>(fn: () => payload): Result<payload, error> => {
	try {
		return success(fn());
	}
	catch (error) {
		return failure<payload, error>(error as error);
	}
};