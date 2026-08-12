import { AppError } from "../utils/AppError.js";
import { isProd } from "../config/env.js";

/**
 * Converts known Mongoose/library errors into structured AppErrors
 * so the main handler can produce consistent responses.
 */
const normalizeError = (err) => {
	// Mongoose duplicate key
	if (err.code === 11000) {
		const field = Object.keys(err.keyValue || {})[0] || "field";
		return new AppError(`${field} already exists`, 409, "DUPLICATE_KEY");
	}

	// Mongoose validation error
	if (err.name === "ValidationError") {
		const msg = Object.values(err.errors)
			.map((e) => e.message)
			.join(", ");
		return new AppError(msg, 422, "VALIDATION_ERROR");
	}

	// Mongoose CastError (invalid ObjectId etc.)
	if (err.name === "CastError") {
		return new AppError(`Invalid ${err.path}: ${err.value}`, 400, "CAST_ERROR");
	}

	// JWT errors
	if (err.name === "JsonWebTokenError") {
		return new AppError("Invalid token", 401, "INVALID_TOKEN");
	}
	if (err.name === "TokenExpiredError") {
		return new AppError("Token expired", 401, "TOKEN_EXPIRED");
	}

	return err;
};

/**
 * Global Express error handler.
 * Must be registered AFTER all routes: app.use(errorHandler)
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
	const normalized = normalizeError(err);

	const statusCode = normalized.statusCode || 500;
	const isOperational = normalized.isOperational === true;

	// In production, never expose internals for unexpected errors
	const message =
		isOperational || !isProd
			? normalized.message
			: "An unexpected error occurred";

	const code = normalized.code || "INTERNAL_ERROR";

	// Log all errors server-side (structured; remove secrets later)
	if (statusCode >= 500) {
		console.error(`[ERROR] ${statusCode} ${code}:`, err);
	}

	return res.status(statusCode).json({
		success: false,
		message,
		code,
	});
};
