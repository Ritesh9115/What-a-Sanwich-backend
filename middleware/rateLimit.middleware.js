import { rateLimit } from "express-rate-limit";

/**
 * Strict rate limiter for auth endpoints.
 * Applies to: login, register, OTP requests, forgot-password.
 * 50 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later",
		code: "RATE_LIMITED",
	},
	validate: { keyGeneratorIpFallback: false },
});

/**
 * General API rate limiter.
 * 300 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later",
		code: "RATE_LIMITED",
	},
	validate: { keyGeneratorIpFallback: false },
});
