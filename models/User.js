import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		newEmail: String,
		newEmailOtp: String,
		newEmailOtpExpires: Date,
		emailChangePending: { type: Boolean, default: false },
		email: {
			type: String,
			unique: true,
			required: true,
		},
		isPhoneVerified: {
			type: Boolean,
			default: false,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		verificationPhoneCode: {
			type: String,
		},
		verificationEmailCode: {
			type: String,
		},
		otpExpiresAt: {
			type: Date,
		},
		profilePic: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Profile",
		},
		resetToken: {
			type: String,
		},
		resetTokenExpiresAt: {
			type: Date,
		},
		address: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Address",
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin", "chef", "delivery"],
			default: "customer",
		},
		pastOrders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
			},
		],
		couponUsage: [
			{
				couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
				usedCount: { type: Number, default: 0 },
			},
		],
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		appleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		authProvider: {
			type: String,
			enum: ["local", "google", "apple", "zomato"],
			default: "local",
		},
		loyalty: {
			type: Number,
			default: 0,
		},
		tag: {
			type: String,
			enum: [
				"new",
				"taster",
				"regular",
				"foodie",
				"snacker",
				"feaster",
				"food-lover",
				"pro",
				"legend",
			],
			default: "new",
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
