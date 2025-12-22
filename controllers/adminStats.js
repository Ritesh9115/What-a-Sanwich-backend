import { Order } from "../models/Order.js";
import httpStatus from "http-status";
import mongoose from "mongoose";

export const dailyItemStats = async (req, res) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const end = new Date();
		end.setHours(23, 59, 59, 999);

		const stats = await Order.aggregate([
			{
				$match: {
					createdAt: { $gte: start, $lte: end },
					status: "completed",
					paymentStatus: "paid",
				},
			},
			{ $unwind: "$items" },
			{
				$group: {
					_id: "$items.itemId",
					totalQuantity: { $sum: "$items.quantity" },
					revenue: {
						$sum: {
							$multiply: ["$items.quantity", "$items.priceAtPurchase"],
						},
					},
					delivery: {
						$sum: {
							$cond: [
								{ $eq: ["$orderType", "delivery"] },
								"$items.quantity",
								0,
							],
						},
					},
					dineIn: {
						$sum: {
							$cond: [{ $eq: ["$orderType", "dine-in"] }, "$items.quantity", 0],
						},
					},
					takeaway: {
						$sum: {
							$cond: [
								{ $eq: ["$orderType", "takeaway"] },
								"$items.quantity",
								0,
							],
						},
					},
				},
			},
			{
				$lookup: {
					from: "menus",
					localField: "_id",
					foreignField: "_id",
					as: "item",
				},
			},
			{ $unwind: "$item" },
			{
				$project: {
					itemId: "$item._id",
					name: "$item.name",
					category: "$item.category",
					totalQuantity: 1,
					revenue: 1,
					delivery: 1,
					dineIn: 1,
					takeaway: 1,
				},
			},
			{ $sort: { totalQuantity: -1 } },
		]);

		res.status(200).json({
			message: "Daily item stats fetched",
			data: stats,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

const todayStats = async (req, res) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const end = new Date();
		end.setHours(23, 59, 59, 999);

		const orders = await Order.find({
			createdAt: { $gte: start, $lte: end },
		});

		let todayTotal = 0;
		let totalOrders = 0;
		let todayDinein = 0;
		let todayDelivery = 0;
		let todayTakeaway = 0;
		let cashPayment = 0;
		let upiPayment = 0;
		let cancelledOrder = 0;

		for (let o of orders) {
			totalOrders++;

			if (o.status === "cancelled") {
				cancelledOrder++;
				continue;
			}

			if (o.status === "completed" && o.paymentStatus === "paid") {
				todayTotal += o.totalAmount;

				if (o.orderType === "dine-in") todayDinein++;
				if (o.orderType === "delivery") todayDelivery++;
				if (o.orderType === "takeaway") todayTakeaway++;

				if (o.paymentMethod === "counter") {
					if (o.paymentType === "cash") cashPayment++;
					if (o.paymentType === "upi") upiPayment++;
				}
			}
		}

		return res.status(httpStatus.OK).json({
			message: "Todays details fetched successfully",
			totalOrders,
			todayTotal,
			todayDinein,
			todayDelivery,
			todayTakeaway,
			cashPayment,
			upiPayment,
			cancelledOrder,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const monthlyStats = async (req, res) => {
	try {
		const now = new Date();
		const month = parseInt(req.query.month) || now.getMonth() + 1;
		const year = parseInt(req.query.year) || now.getFullYear();

		const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
		const end = new Date(year, month, 0, 23, 59, 59, 999);

		const orders = await Order.find({
			createdAt: { $gte: start, $lte: end },
		});

		let totalOrders = orders.length;
		let totalRevenue = 0;
		let dineIn = 0;
		let delivery = 0;
		let takeaway = 0;
		let cancelled = 0;
		let cash = 0;
		let upi = 0;

		for (let o of orders) {
			if (o.status === "cancelled") {
				cancelled++;
				continue;
			}

			if (o.status === "completed" && o.paymentStatus === "paid") {
				totalRevenue += o.totalAmount;

				if (o.orderType === "dine-in") dineIn++;
				if (o.orderType === "delivery") delivery++;
				if (o.orderType === "takeaway") takeaway++;

				if (o.paymentMethod === "counter") {
					if (o.paymentType === "cash") cash++;
					if (o.paymentType === "upi") upi++;
				}
			}
		}

		return res.status(httpStatus.OK).json({
			message: "Monthly stats fetched",
			month,
			year,
			totalOrders,
			totalRevenue,
			dineIn,
			delivery,
			takeaway,
			cancelled,
			cash,
			upi,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

const yearlyStats = async (req, res) => {
	try {
		const now = new Date();
		const year = parseInt(req.query.year) || now.getFullYear();

		let result = [];

		for (let month = 1; month <= 12; month++) {
			const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
			const end = new Date(year, month, 0, 23, 59, 59, 999);

			const orders = await Order.find({
				createdAt: { $gte: start, $lte: end },
			});

			let totalOrders = orders.length;
			let revenue = 0;
			let cancelled = 0;

			for (let o of orders) {
				if (o.status === "cancelled") {
					cancelled++;
					continue;
				}

				if (o.status === "completed" && o.paymentStatus === "paid") {
					revenue += o.totalAmount;
				}
			}

			result.push({
				month,
				totalOrders,
				revenue,
				cancelled,
			});
		}

		return res.status(httpStatus.OK).json({
			message: "Yearly stats fetched",
			year,
			data: result,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

const rangeStats = async (req, res) => {
	try {
		const { from, to } = req.body;

		const start = new Date(from);
		start.setHours(0, 0, 0, 0);

		const end = new Date(to);
		end.setHours(23, 59, 59, 999);

		const orders = await Order.find({
			createdAt: { $gte: start, $lte: end },
		});

		let totalOrders = orders.length;
		let totalRevenue = 0;
		let dineIn = 0;
		let delivery = 0;
		let takeaway = 0;
		let cancelled = 0;
		let cash = 0;
		let upi = 0;

		for (let o of orders) {
			if (o.status === "cancelled") {
				cancelled++;
				continue;
			}

			if (o.status === "completed" && o.paymentStatus === "paid") {
				totalRevenue += o.totalAmount;

				if (o.orderType === "dine-in") dineIn++;
				if (o.orderType === "delivery") delivery++;
				if (o.orderType === "takeaway") takeaway++;

				if (o.paymentMethod === "counter") {
					if (o.paymentType === "cash") cash++;
					if (o.paymentType === "upi") upi++;
				}
			}
		}

		return res.status(httpStatus.OK).json({
			message: "Range stats fetched successfully",
			from,
			to,
			totalOrders,
			totalRevenue,
			dineIn,
			delivery,
			takeaway,
			cancelled,
			cash,
			upi,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

export { todayStats, yearlyStats, monthlyStats, rangeStats };
