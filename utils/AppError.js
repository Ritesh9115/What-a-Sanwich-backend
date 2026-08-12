/**
 * AppError — a structured error class for expected operational errors.
 * Controllers and services throw AppError instances; the global handler catches them.
 * Non-AppError (programming errors) are treated as 500s without leaking internals.
 */
export class AppError extends Error {
	constructor(message, statusCode, code = null) {
		super(message);
		this.statusCode = statusCode;
		this.code = code; // e.g. "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED"
		this.isOperational = true; // distinguishes expected from unexpected errors
		Error.captureStackTrace(this, this.constructor);
	}
}
