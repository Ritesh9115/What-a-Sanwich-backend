import { User } from "../models/User.js";
import { Profile } from "../models/Profile.js";
import { sendOtp } from "./Auth.js";

const updateUser = async (req, res) => {
	try {
		const userId = req.user._id;
		const { name, phone } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (name) user.name = name;

		if (phone && phone !== user.phone) {
			const exists = await User.findOne({ phone });
			if (exists)
				return res.status(400).json({ message: "Phone already in use" });

			user.phone = phone;
		}

		await user.save();

		return res.status(200).json({
			message: "Profile updated successfully",
			user,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

const getLoyalty = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json({
			points: user.loyalty, // FIXED
			tag: user.tag,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

const updateProfilePic = async (req, res) => {
	try {
		const { profileId } = req.body;

		if (!profileId)
			return res.status(400).json({ message: "Profile ID required" });

		const profile = await Profile.findOne({
			_id: profileId,
			isActive: true,
		});

		if (!profile)
			return res.status(404).json({ message: "Profile not available" });

		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		user.profilePic = profileId;
		await user.save();

		res.status(200).json({
			message: "Profile picture updated",
			profile,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

const deleteAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		user.email = `${user.email}_deleted_${Date.now()}`;
		user.phone = undefined;
		user.password = "DELETED_" + Date.now(); // FIXED
		user.resetToken = null;
		user.resetTokenExpiresAt = null;
		user.isDeleted = true;

		await user.save();

		return res.status(200).json({
			message: "Account deleted successfully",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

const requestEmailChange = async (req, res) => {
	try {
		const { newEmail } = req.body;

		if (!newEmail)
			return res.status(400).json({ message: "New email required" });

		const exists = await User.findOne({ email: newEmail });
		if (exists)
			return res.status(400).json({ message: "Email already in use" });

		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		const otp = Math.floor(100000 + Math.random() * 900000);
		const expires = Date.now() + 5 * 60 * 1000;

		user.newEmail = newEmail;
		user.newEmailOtp = otp;
		user.newEmailOtpExpires = expires;
		user.emailChangePending = true;

		await user.save();
		await sendOtp(newEmail, otp);

		return res.status(200).json({ message: "OTP sent to new email" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

const verifyEmailChange = async (req, res) => {
	try {
		const { otp } = req.body;

		if (!otp) return res.status(400).json({ message: "OTP required" });

		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!user.emailChangePending)
			return res.status(400).json({ message: "No email change requested" });

		if (Date.now() > user.newEmailOtpExpires)
			return res.status(410).json({ message: "OTP expired" });

		if (String(user.newEmailOtp) !== String(otp))
			return res.status(400).json({ message: "Invalid OTP" });

		// Update email
		user.email = user.newEmail;

		// Clear fields
		user.newEmail = undefined;
		user.newEmailOtp = undefined;
		user.newEmailOtpExpires = undefined;
		user.emailChangePending = false;

		await user.save();

		return res.status(200).json({ message: "Email updated successfully" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

const fetchUserDetails = async (req, res) => {
	try {
		const userId = req.user._id;

		const user = await User.findById(userId)
			.select("name email phone profilePic role createdAt isEmailVerified")
			.populate({
				path: "profilePic",
				select: "name pictureUrl",
			});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({
			message: "User details fetched successfully",
			user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

export {
	updateUser,
	getLoyalty,
	updateProfilePic,
	requestEmailChange,
	verifyEmailChange,
	deleteAccount,
	fetchUserDetails,
};
