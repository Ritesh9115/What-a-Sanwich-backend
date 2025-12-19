import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { socketConnection } from "./webSockets/Socket.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1);
const Port = process.env.PORT || "3000";
const allowedOrigins = [
	"https://what-a-sanwich-frontend.vercel.app",
	"https://www.what-a-sanwich-frontend.vercel.app",
];

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				return callback(
					new Error(
						"The CORS policy for this site does not allow access from the specified Origin."
					),
					false
				);
			}
			return callback(null, true);
		},
		credentials: true,
	})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.set("Port",process.env.PORT || "3000");

const server = createServer(app);
socketConnection(server);

console.log("User routes loaded");
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

const start = async () => {
	try {
		const connectionDb = await mongoose.connect(process.env.MONGODB_URL);
		// console.log("Connected to mongoDb");
		server.listen(Port, () => {
			// console.log(`server is listening on ${Port}`);
		});
	} catch (error) {
		// console.log(error);
		return err;
	}
};

app.get("/", (req, res) => {
	res.send("hello world");
});

start();
