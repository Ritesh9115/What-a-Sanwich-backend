import httpStatus from "http-status";
import { User } from "../models/User.js";
import argon2 from "argon2";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
dotenv.config();

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.GMAIL_ACCOUNT,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
});

const sendOtp = async (to, otp) => {
	try {
		console.log("GMAIL_ACCOUNT:", process.env.GMAIL_ACCOUNT);
		console.log(
			"GMAIL_APP_PASSWORD:",
			process.env.GMAIL_APP_PASSWORD ? "SET" : "MISSING"
		);

		await transporter.sendMail({
			from: process.env.GMAIL_ACCOUNT,
			to: to,
			subject: "What A Sandwich - Email Verification OTP",
			html: `
            <div style="
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 40px 20px;
                margin: 0;
            ">
                <div style="
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(213, 35, 0, 0.1); /* Matching Navbar Shadow opacity */
                ">
                    <div style="
                        background: linear-gradient(135deg, rgba(245, 230, 211, 1) 0%, rgba(235, 204, 169, 1) 100%);
                        padding: 30px 20px;
                        text-align: center;
                        border-bottom: 2px solid #d62300; /* Theme Primary Border */
                    ">
                        <h1 style="
                            color: #512314; /* rgba(81, 35, 20, 1) - Dark Brown */
                            margin: 0;
                            font-size: 24px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">
                            What's a Sandwich
                        </h1>
                    </div>

                    <div style="padding: 40px 30px; text-align: center;">
                        <h2 style="
                            color: #512314; /* Dark Brown */
                            margin-top: 0;
                            font-size: 20px;
                            font-weight: 700;
                        ">
                            Email Verification
                        </h2>
                        
                        <p style="
                            color: rgba(81, 35, 20, 0.8); /* Matching Inactive Nav Color */
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 30px;
                        ">
                            Hello! To complete your request, please use the One-Time Password (OTP) below.
                        </p>

                        <div style="
                            background-color: #fffaf5; /* Very light beige */
                            border: 2px dashed #d62300; /* Theme Primary */
                            border-radius: 12px;
                            padding: 20px;
                            display: inline-block;
                            margin-bottom: 30px;
                        ">
                            <h1 style="
                                color: #d62300; /* Theme Primary */
                                font-size: 36px;
                                letter-spacing: 8px;
                                margin: 0;
                                font-weight: 800;
                                line-height: 1;
                            ">${otp}</h1>
                        </div>

                        <p style="
                            color: rgba(81, 35, 20, 0.6);
                            font-size: 14px;
                            margin: 0;
                        ">
                            This OTP is valid for <strong style="color: #d62300;">5 minutes</strong>.
                        </p>
                    </div>

                    <div style="
                        background-color: #faf7f2; /* Light Beige Footer */
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid rgba(235, 204, 169, 0.5);
                    ">
                        <p style="
                            color: rgba(81, 35, 20, 0.5);
                            font-size: 12px;
                            margin: 0;
                        ">
                            If you didn't request this code, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            </div>`,
		});
	} catch (error) {
		console.log(error);
	}
};

const register = async (req, res) => {
	let { name, phone, email, password, cnfPassword } = req.body;
	try {
		if (!name || !phone || !password || !email || !cnfPassword) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Missing required fields" });
		}
		const existingUser = await User.findOne({ phone });
		if (existingUser) {
			return res
				.status(httpStatus.CONFLICT)
				.json({ message: "User Already Exists" });
		}
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res
				.status(httpStatus.CONFLICT)
				.json({ message: "Email Already Exists" });
		}
		if (password.trim() !== cnfPassword.trim()) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Password and confirm Password Doesn't match" });
		}

		const verificationEmailCode = Math.floor(100000 + Math.random() * 900000);
		// console.log(verificationEmailCode);
		const otpExpiresAt = Date.now() + 5 * 60 * 1000;
		await sendOtp(email, verificationEmailCode);

		const hashPassword = await argon2.hash(password.trim());
		const newUser = new User({
			name: name.trim().toLowerCase(),
			password: hashPassword,
			phone: String(phone).trim(),
			email: email.trim().toLowerCase(),
			isEmailVerified: false,
			verificationEmailCode,
			otpExpiresAt,
		});
		await newUser.save();

		return res.status(httpStatus.CREATED).json({
			message: "User Registered",
			user: {
				name: newUser.name,
				phone: newUser.phone,
				email: newUser.email,
			},
		});
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const verifyEmail = async (req, res) => {
	let { email, otp } = req.body;

	if (!email || !otp) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}
	otp = otp.toString().trim();
	const user = await User.findOne({ email });
	if (!user) {
		return res
			.status(httpStatus.NOT_FOUND)
			.json({ message: "user not  Found" });
	}

	if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
		user.verificationEmailCode = null;
		user.otpExpiresAt = null;
		await user.save();
		return res.status(httpStatus.GONE).json({ message: "OTP expired" });
	}
	if (!user.verificationEmailCode) {
		return res
			.status(httpStatus.CONFLICT)
			.json({ message: "No active OTP. Please request a new one." });
	}

	if (user.verificationEmailCode.toString().trim() != otp) {
		return res.status(httpStatus.CONFLICT).json({ message: "Otp not match" });
	}
	user.verificationEmailCode = null;
	user.isEmailVerified = true;
	user.otpExpiresAt = null;
	await user.save();

	return res
		.status(httpStatus.OK)
		.json({ message: "Email successfully verified" });
};

const resendOtp = async (req, res) => {
	let { email } = req.body;
	if (!email) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Email is required" });
	}
	const user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}

	const now = Date.now();

	if (
		user.otpExpiresAt &&
		now < new Date(user.otpExpiresAt).getTime() - 4 * 60 * 1000
	) {
		return res.status(429).json({
			message: "Please wait before requesting another OTP",
		});
	}

	const newOtp = Math.floor(100000 + Math.random() * 900000);
	const otpExpiresAt = Date.now() + 5 * 60 * 1000;

	await sendOtp(email, newOtp);

	user.verificationEmailCode = newOtp;
	user.otpExpiresAt = otpExpiresAt;
	await user.save();

	return res.status(httpStatus.OK).json({ message: "OTP resent successfully" });
};

const changePassword = async (req, res) => {
	let { oldPassword, newPassword, cnfNewPassword } = req.body;
	let email = req.user.email;

	if (!oldPassword || !newPassword || !cnfNewPassword || !email) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "All field required" });
	}

	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	const isMatched = await argon2.verify(user.password, oldPassword);
	if (!isMatched) {
		return res
			.status(httpStatus.NOT_FOUND)
			.json({ message: "Password does not match" });
	}
	newPassword = newPassword.trim();
	cnfNewPassword = cnfNewPassword.trim();
	if (cnfNewPassword != newPassword) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Password and confirm Password Doesn't match" });
	}

	const hashPassword = await argon2.hash(newPassword);
	user.password = hashPassword;
	await user.save();
	return res
		.status(httpStatus.OK)
		.json({ message: "password changes successfully" });
};

const forgotPassword = async (req, res) => {
	let { email } = req.body;
	if (!email) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Email is required" });
	}
	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	const newOtp = Math.floor(100000 + Math.random() * 900000);
	const otpExpiresAt = Date.now() + 5 * 60 * 1000;

	user.verificationEmailCode = newOtp;
	user.otpExpiresAt = otpExpiresAt;
	user.resetToken = null;
	user.resetTokenExpiresAt = null;
	await sendOtp(email, newOtp);
	await user.save();

	res.status(200).json({ message: "OTP sent to email" });
};

const verifyForgotOtp = async (req, res) => {
	let { email, otp } = req.body;
	if (!email || !otp) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Email is required" });
	}
	otp = otp.toString().trim();
	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
		user.verificationEmailCode = null;
		user.otpExpiresAt = null;
		await user.save();
		return res.status(httpStatus.GONE).json({ message: "OTP expired" });
	}
	if (!user.verificationEmailCode) {
		return res
			.status(httpStatus.CONFLICT)
			.json({ message: "No active OTP. Please request a new one." });
	}
	if (user.verificationEmailCode != otp) {
		return res.status(httpStatus.CONFLICT).json({ message: "Otp not match" });
	}
	const resetToken = Math.random().toString(36).substring(2, 15);

	user.verificationEmailCode = null;
	user.otpExpiresAt = null;
	user.resetToken = resetToken;
	user.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
	await user.save();

	return res.status(200).json({ message: "Otp verified", resetToken });
};

const resetPassword = async (req, res) => {
	let { email, resetToken, newPassword, cnfNewPassword } = req.body;

	if (!email || !resetToken || !newPassword || !cnfNewPassword)
		return res.status(400).json({ message: "Missing fields" });

	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}

	if (!user.resetToken || user.resetToken !== resetToken)
		return res.status(401).json({ message: "Invalid reset token" });

	if (Date.now() > user.resetTokenExpiresAt)
		return res.status(410).json({ message: "Reset token expired" });

	if (newPassword !== cnfNewPassword)
		return res.status(400).json({ message: "Passwords do not match" });

	user.password = await argon2.hash(newPassword);
	user.resetToken = null;
	user.resetTokenExpiresAt = null;

	await user.save();
	return res.status(200).json({ message: "Password reset successfully" });
};

const login = async (req, res) => {
	let { email, loginPassword } = req.body;
	if (!email || !loginPassword) {
		return res.status(400).json({ message: "Missing fields" });
	}

	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	if (!user.isEmailVerified) {
		return res.status(403).json({ message: "Email not verified" });
	}

	const isMatched = await argon2.verify(user.password, loginPassword);
	if (!isMatched) {
		return res
			.status(httpStatus.NOT_FOUND)
			.json({ message: "Password does not match" });
	}
	console.log("SIGN SECRET:", process.env.JWT_HIDDEN_SECERT);

	const token = jwt.sign(
		{
			id: user._id,
			role: user.role,
			email: user.email,
		},
		process.env.JWT_HIDDEN_SECERT,
		{ expiresIn: "15d" }
	);

	res.cookie("token", token, {
		httpOnly: true,
		secure: true,
		maxAge: 15 * 24 * 60 * 60 * 1000,
		sameSite: "none",
	});

	user.password = undefined;
	return res.status(200).json({
		message: "Login successful",
		user,
	});
};

const loginWithOtp = async (req, res) => {
	let { email } = req.body;
	if (!email) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Email is required" });
	}

	let user = await User.findOne({ email });

	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	if (!user.isEmailVerified) {
		return res
			.status(httpStatus.CONFLICT)
			.json({ message: "Email not verified" });
	}
	const newOtp = Math.floor(100000 + Math.random() * 900000);
	const otpExpiresAt = Date.now() + 5 * 60 * 1000;

	user.verificationEmailCode = newOtp;
	user.otpExpiresAt = otpExpiresAt;
	user.resetToken = null;
	user.resetTokenExpiresAt = null;
	await sendOtp(email, newOtp);
	await user.save();

	res.status(200).json({ message: "OTP sent to email" });
};

const verifyLoginWithOtp = async (req, res) => {
	let { email, otp } = req.body;
	if (!email || !otp) {
		return res
			.status(httpStatus.BAD_REQUEST)
			.json({ message: "Email is required" });
	}
	otp = otp.toString().trim();
	let user = await User.findOne({ email });
	if (!user) {
		return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
	}
	if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
		user.verificationEmailCode = null;
		user.otpExpiresAt = null;
		await user.save();
		return res.status(httpStatus.GONE).json({ message: "OTP expired" });
	}
	if (!user.verificationEmailCode) {
		return res
			.status(httpStatus.CONFLICT)
			.json({ message: "No active OTP. Please request a new one." });
	}
	if (user.verificationEmailCode != otp) {
		return res.status(httpStatus.CONFLICT).json({ message: "Otp not match" });
	}
	const token = jwt.sign(
		{
			id: user._id,
			role: user.role,
			email: user.email,
		},
		process.env.JWT_HIDDEN_SECERT,
		{ expiresIn: "15d" }
	);
	res.cookie("token", token, {
		httpOnly: true,
		secure: true,
		maxAge: 15 * 24 * 60 * 60 * 1000,
		sameSite: "none",
	});

	user.verificationEmailCode = null;
	user.otpExpiresAt = null;
	await user.save();
	user.password = undefined;

	return res.status(200).json({ message: "Otp verified", user });
};

const logout = async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});
	return res.status(200).json({ message: "Logged out successfully" });
};

export {
	register,
	verifyEmail,
	resendOtp,
	changePassword,
	verifyForgotOtp,
	forgotPassword,
	resetPassword,
	login,
	sendOtp,
	loginWithOtp,
	verifyLoginWithOtp,
	logout,
};
