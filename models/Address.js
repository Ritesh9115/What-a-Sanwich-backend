import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	addressType: {
		type: String,
		enum: ["home", "work", "other"],
		default: "home",
	},
	isDefault: {
		type: Boolean,
		default: false,
	},
	fullName: String,
	pincode: String,
	latitude: Number,
	longitude: Number,

	phone: {
		type: String,
		required: true,
	},
	landmark: {
		type: String,
	},
	city: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	state: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
});

const Address = mongoose.model("Address", addressSchema);

export { Address };
