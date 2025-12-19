import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		items: [
			{
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Menu",
				},
				quantity: {
					type: Number,
					default: 1,
					required: true,
				},
				size: {
					type: String,
				},
				priceAtPurchase: {
					type: Number,
					required: true,
				},
			},
		],
		coupons: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coupons",
		},
		orderType: {
			type: String,
			enum: ["dine-in", "takeaway", "delivery"],
		},
		tableNumber: {
			type: Number,
		},
		deliveryAddress: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
		},
		orderNumber: {
			type: Number,
			required: true,
		},
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		deliveryStatus: {
			type: String,
			enum: [
				"unassigned",
				"assigned",
				"accepted",
				"out_for_delivery",
				"delivered",
			],
			default: "unassigned",
		},
		status: {
			type: String,
			enum: [
				"pending",
				"accepted",
				"preparing",
				"ready",
				"completed",
				"cancelled",
			],
			default: "pending",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
		paymentType: {
			type: String,
			enum: ["cash", "upi", "card", "wallet", "none"],
		},
		paymentMethod: {
			type: String,
			enum: ["cod", "counter", "online", "upi"],
			default: "online",
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		razorpayOrderId: String,
		razorpayPaymentId: String,
		razorpaySignature: String,
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export { Order };
