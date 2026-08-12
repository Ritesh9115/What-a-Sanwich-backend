/**
 * Centralized environment variable access.
 * Fails fast on startup if a required variable is missing.
 * Variable names are preserved exactly as they exist in the deployed environment.
 *
 * NOTE: dotenv is loaded here — NOT in app.js — because ES module imports are
 * hoisted and evaluated before the module body runs. If dotenv.config() were
 * called in app.js, env.js would fire first with an empty process.env.
 */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Resolve .env relative to this file so it works regardless of process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });


const required = (key) => {
	const val = process.env[key];
	if (!val) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return val;
};

const optional = (key, fallback = undefined) => process.env[key] ?? fallback;

export const env = {
	// Server
	PORT: optional("PORT", "3000"),
	NODE_ENV: optional("NODE_ENV", "production"),

	// Database
	MONGODB_URL: required("MONGODB_URL"),

	// Auth — NOTE: typo "SECERT" is intentional; this is the deployed variable name
	JWT_HIDDEN_SECERT: required("JWT_HIDDEN_SECERT"),

	// Email
	RESEND_API_KEY: required("RESEND_API_KEY"),

	// Cloudinary
	CLOUDINARY_NAME: required("CLOUDINARY_NAME"),
	CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
	CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
};

export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";

/**
 * Dynamic cookie options for login/auth endpoints.
 * In development (localhost): secure=false, sameSite="lax", no domain attribute so localhost accepts it.
 * In production: secure=true, sameSite="none", domain=".sandwichstore.in".
 */
export const getCookieOptions = () => ({
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
	...(isProd ? { domain: ".sandwichstore.in" } : {}),
	maxAge: 15 * 24 * 60 * 60 * 1000,
});

export const getClearCookieOptions = () => ({
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
	...(isProd ? { domain: ".sandwichstore.in" } : {}),
});

