import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import httpStatus from "http-status";
import { User } from "../models/User.js";

dotenv.config();

const isLogin = (allowedRole = []) => {
	return async (req, res, next) => {
		try {
			const token = req.cookies?.token;

			if (!token) {
				return res.status(httpStatus.UNAUTHORIZED).json({
					message: "Please login first",
				});
			}

			// 2️⃣ Verify JWT
			const decoded = jwt.verify(token, process.env.JWT_HIDDEN_SECERT);

			// 3️⃣ Fetch user from DB
			const user = await User.findById(decoded.id);

			if (!user) {
				return res.status(httpStatus.NOT_FOUND).json({
					message: "User no longer exists",
				});
			}

			// 4️⃣ Role check (ONLY if roles are provided)
			if (allowedRole.length > 0 && !allowedRole.includes(user.role)) {
				return res.status(httpStatus.FORBIDDEN).json({
					message: "Access denied",
				});
			}

			// 5️⃣ Attach user to request
			req.user = user;
			next();
		} catch (error) {
			console.log("JWT ERROR:", error.message);
			return res.status(httpStatus.UNAUTHORIZED).json({
				message: "Invalid or expired token",
			});
		}
	};
};

export { isLogin };
