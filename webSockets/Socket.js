import dotenv from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

let io;

const socketConnection = (server) => {
	io = new Server(server, {
		cors: {
			origin: [
				"http://localhost:5173",
				"https://what-a-sanwich-frontend.vercel.app",
			],
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	// Authentication middleware
	io.use((socket, next) => {
		try {
			const cookie = socket.handshake.headers.cookie;
			if (!cookie) return next(new Error("No cookie found"));

			const token = cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (!token) return next(new Error("Token missing"));

			const decoded = jwt.verify(token, process.env.JWT_HIDDEN_SECERT);
			socket.role = decoded.role;
			socket.userId = decoded._id;
			next();
		} catch (err) {
			next(new Error("Auth failed"));
		}
	});

	// After successful auth
	io.on("connection", (socket) => {
		// console.log("User connected:", socket.id, socket.role);

		if (socket.role === "admin") socket.join("admin_room");
		if (socket.role === "chef") socket.join("chef_room");
		if (socket.role === "delivery") socket.join("delivery_room");

		socket.join(`user_${socket.userId}`);
		socket.on("join_room", (room) => {
			socket.join(room);
			// console.log(`Socket ${socket.id} manually joined ${room}`);
		});

		socket.on("disconnect", () => {
			// console.log("User disconnected:", socket.id);
		});
	});

	return io;
};

const getIO = () => {
	if (!io) throw new Error("Socket.io not initialized!");
	return io;
};

export { socketConnection, getIO };
