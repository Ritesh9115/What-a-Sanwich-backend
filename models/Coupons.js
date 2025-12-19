import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
		},

		validFor: {
			type: String,
			enum: ["all", "new-users", "specific-user"],
		},
		discountType: {
			type: String,
			enum: ["flat", "percent"],
			required: true,
		},
		discountValue: {
			type: Number,
			required: true,
		},
		specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		minOrderValue: Number,
		maxDiscount: Number,
		validFrom: Date,
		validTill: Date,
		perUserLimit: Number,
		maxUsage: Number, // total usage allowed
		usedCount: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export { Coupon };
