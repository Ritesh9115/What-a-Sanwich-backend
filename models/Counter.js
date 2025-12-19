import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
	date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
	seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);
