import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

/**
 * isLogin(allowedRoles)
 * Middleware factory that:
 *  1. Reads the httpOnly cookie "token"
 *  2. Verifies the JWT
 *  3. Fetches the user from DB (catches deleted/non-existent accounts)
 *  4. Checks the user is not soft-deleted
 *  5. Enforces role-based access if allowedRoles is provided
 */
const isLogin = (allowedRole = []) => {
	return async (req, res, next) => {
		try {
			const token =
				req.cookies?.token ||
				req.headers.authorization?.replace(/^Bearer\s+/i, "");

			if (!token) {
				return res.status(httpStatus.UNAUTHORIZED).json({
					success: false,
					message: "Please login first",
					code: "UNAUTHENTICATED",
				});
			}

			const decoded = jwt.verify(token, env.JWT_HIDDEN_SECERT);

			const user = await User.findById(decoded.id);

			if (!user) {
				return res.status(httpStatus.NOT_FOUND).json({
					success: false,
					message: "User no longer exists",
					code: "USER_NOT_FOUND",
				});
			}

			// Block soft-deleted accounts from using their existing JWT
			if (user.isDeleted) {
				return res.status(httpStatus.UNAUTHORIZED).json({
					success: false,
					message: "Account has been deleted",
					code: "ACCOUNT_DELETED",
				});
			}

			if (allowedRole.length > 0 && !allowedRole.includes(user.role)) {
				return res.status(httpStatus.FORBIDDEN).json({
					success: false,
					message: "Access denied",
					code: "FORBIDDEN",
				});
			}

			req.user = user;
			next();
		} catch (error) {
			return res.status(httpStatus.UNAUTHORIZED).json({
				success: false,
				message: "Invalid or expired token",
				code: "INVALID_TOKEN",
			});
		}
	};
};

export { isLogin };
