import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema({
	uniCode: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String, // paneer momo // veg momo
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	subCategory: {
		type: String, //fired momos // steam momos
	},
	isFeatured: {
		type: Boolean,
		default: false,
	},
	variants: [
		{
			size: {
				type: String,
			},
			price: {
				type: Number,
				required: true,
			},
		},
	],
	isVeg: {
		type: Boolean,
		default: true,
	},
	isAvailable: {
		type: Boolean,
		default: true,
	},
	rating: {
		type: Number,
		default: 0,
	},
	preparationTime: {
		type: Number, // in minutes
		default: 10,
	},
	discountPrice: {
		type: Number,
	},
});

const Menu = mongoose.model("Menu", menuSchema);

export { Menu };
