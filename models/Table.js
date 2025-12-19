import mongoose, { Schema } from "mongoose";

const tableSchema = new Schema(
	{
		tableNumber: { type: Number, required: true, unique: true },
		// isOccupied: Boolean,
		isDisabled: { type: Boolean, default: false },
		currentOrder: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			default: null,
		},
	},
	{ timestamps: true }
);

const Table = mongoose.model("Table", tableSchema);

export { Table };
