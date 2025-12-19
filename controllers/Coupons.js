import { Coupon } from "../models/Coupons.js";
import httpStatus from "http-status";

const addCoupon = async (req, res) => {
	try {
		const {
			code,
			description,
			validFor,
			discountType,
			discountValue,
			specificUsers,
			minOrderValue,
			maxDiscount,
			validFrom,
			validTill,
			perUserLimit,
			maxUsage,
		} = req.body;

		if (!code || !discountType || !discountValue) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Missing required fields" });
		}

		if (req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorized access" });
		}

		const exists = await Coupon.findOne({ code });
		if (exists) {
			return res.status(409).json({ message: "Coupon code already exists" });
		}

		const newCoupon = new Coupon({
			code,
			description,
			validFor,
			discountType,
			discountValue,
			specificUsers,
			minOrderValue,
			maxDiscount,
			validFrom,
			validTill,
			perUserLimit,
			maxUsage,
		});

		await newCoupon.save();

		return res
			.status(201)
			.json({ message: "New Coupon Created", coupon: newCoupon });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const deleteCoupon = async (req, res) => {
	try {
		const { couponId } = req.body;

		if (!couponId) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		if (req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorized access" });
		}

		const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

		if (!deletedCoupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		return res.status(200).json({
			message: "Coupon deleted",
			coupon: deletedCoupon,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const updateCoupon = async (req, res) => {
	try {
		const { couponId, updates } = req.body;

		if (!couponId || !updates) {
			return res.status(400).json({ message: "couponId and updates required" });
		}

		if (req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorized access" });
		}

		const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedCoupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		return res.status(200).json({
			message: "Coupon updated",
			coupon: updatedCoupon,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const listAllCoupon = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorized access" });
		}

		const coupons = await Coupon.find();

		return res.status(200).json({
			message: "Successfully fetched all coupons",
			coupons,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

export { addCoupon, deleteCoupon, updateCoupon, listAllCoupon };
