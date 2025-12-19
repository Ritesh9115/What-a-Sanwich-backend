import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		icon: {
			type: String,
			default: "restaurant",
		},
		image: {
			url: String,
			public_id: String,
		},

		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
