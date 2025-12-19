import httpStatus from "http-status";
import { User } from "../models/User.js";

const deleteUser = async (req, res) => {
	try {
		let { userId } = req.body;
		if (!userId) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Required All fields" });
		}
		if (!req.user || req.user.role !== "admin") {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Not authorized" });
		}
		const deletedUser = await User.findByIdAndDelete(userId);
		if (!deletedUser) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "User not exisits" });
		}
		return res.status(httpStatus.OK).json({ message: "Successfully Deleted" });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const chngRole = async (req, res) => {
	try {
		let { userId, role } = req.body;
		if (!userId || !role) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Required All fields" });
		}
		if (!req.user || req.user.role !== "admin") {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Not authorized" });
		}
		const VALID_ROLES = ["admin", "chef", "delivery", "customer"];
		if (!VALID_ROLES.includes(role)) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Invalid role provided" });
		}
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "User not exisits" });
		}
		user.role = role;
		await user.save();
		return res
			.status(httpStatus.OK)
			.json({ message: "Successfully Updated", user });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const showAllUsers = async (req, res) => {
	try {
		if (!req.user || req.user.role !== "admin") {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Not authorized" });
		}
		const users = await User.find();
		return res
			.status(httpStatus.OK)
			.json({ message: "Users fetched successfully", users });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const searchByEmail = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Required All fields" });
		}
		if (!req.user || req.user.role !== "admin") {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Not authorized" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "No user found" });
		}
		return res
			.status(httpStatus.OK)
			.json({ message: "User fetched successfully", user });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

export { deleteUser, chngRole, showAllUsers, searchByEmail };
