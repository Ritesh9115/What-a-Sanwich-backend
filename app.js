import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";

import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { socketConnection } from "./webSockets/Socket.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimit.middleware.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



const app = express();

// ── Trust proxy (required for rate-limiter IP detection behind Render/Railway/etc.) ──
app.set("trust proxy", 1);

// ── Security headers ──
app.use(helmet());

// ── CORS ──
app.use(cors(corsOptions));

// ── Body parsing ──
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── General rate limiter on all API routes ──
app.use("/api", generalLimiter);

// ── Health check ──
app.get("/", (req, res) => {
	res.json({ status: "ok", app: "What A Sandwich API" });
});

// ── Routes ──
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// ── 404 handler ──
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
		code: "NOT_FOUND",
	});
});

// ── Global error handler (must be last) ──
app.use(errorHandler);

// ── HTTP + Socket.IO server ──
const server = createServer(app);
socketConnection(server);

// ── Database + server startup ──
const start = async () => {
	try {
		await mongoose.connect(env.MONGODB_URL);
		server.listen(env.PORT, () => {
			console.log(`[server] Running on port ${env.PORT}`);
		});
	} catch (error) {
		console.error("[server] Failed to start:", error.message);
		process.exit(1);
	}
};

start();
