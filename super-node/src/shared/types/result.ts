/**
 * Result Monad — Functional error handling
 * Eliminates try/catch in domain & application layers.
 * All use cases return Result<T, E> instead of throwing.
 */

export type Result<T, E = AppError> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Failure<E> {
  readonly ok: false;
  readonly error: E;
}

export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

export function failure<E>(error: E): Failure<E> {
  return { ok: false, error };
}

/**
 * Base application error structure
 */
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
}

/**
 * Type guard helpers
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.ok === true;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.ok === false;
}

/**
 * Unwrap a result or throw (only use at boundary layers)
 */
export function unwrapOrThrow<T, E extends AppError>(result: Result<T, E>): T {
  if (isSuccess(result)) return result.value;
  throw new Error(`[${result.error.code}] ${result.error.message}`);
}
