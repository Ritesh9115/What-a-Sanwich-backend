import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { allowedOrigins } from "../config/cors.js";

let io;

/**
 * Initialize Socket.IO on the existing HTTP server.
 * Auth: reads the httpOnly cookie "token" from the handshake headers.
 * Rooms: admin/chef/delivery users join their role rooms automatically.
 *        Every authenticated user joins a personal room "user_<userId>".
 */
const socketConnection = (server) => {
	io = new Server(server, {
		cors: {
			origin: allowedOrigins,
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	// ── Auth middleware ──
	io.use((socket, next) => {
		try {
			const cookie = socket.handshake.headers.cookie;
			if (!cookie) return next(new Error("No cookie found"));

			const token = cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (!token) return next(new Error("Token missing"));

			const decoded = jwt.verify(token, env.JWT_HIDDEN_SECERT);
			socket.role = decoded.role;
			socket.userId = decoded.id;
			next();
		} catch {
			next(new Error("Auth failed"));
		}
	});

	// ── Connection handler ──
	io.on("connection", (socket) => {
		// Auto-join role rooms (server-authoritative — not client-requested)
		if (socket.role === "admin") socket.join("admin_room");
		if (socket.role === "chef") socket.join("chef_room");
		if (socket.role === "delivery") socket.join("delivery_room");

		// Always join personal room for order updates
		socket.join(`user_${socket.userId}`);

		// Allow the client to manually join additional rooms (kept for compatibility)
		socket.on("join_room", (room) => {
			socket.join(room);
		});

		socket.on("error", (err) => {
			console.error(`[socket] Error on socket ${socket.id}:`, err.message);
		});

		socket.on("disconnect", () => {
			// Cleanup is automatic (Socket.IO removes from all rooms)
		});
	});

	return io;
};

/**
 * Get the initialized io instance.
 * Throws if called before socketConnection() runs.
 */
const getIO = () => {
	if (!io) throw new Error("Socket.IO not initialized");
	return io;
};

export { socketConnection, getIO };
