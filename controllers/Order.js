import { Order } from "../models/Order.js";
import { Menu } from "../models/Menu.js";
import { User } from "../models/User.js";
import { Coupon } from "../models/Coupons.js";
import { Table } from "../models/Table.js";
import { getIO } from "../webSockets/Socket.js";
import dotenv from "dotenv";
import { Counter } from "../models/Counter.js";
import dayjs from "dayjs";

dotenv.config();

/* ==========================================================================
   HELPER: Create Order Logic
   (No changes here to allow Admins to have multiple active table orders)
   ========================================================================== */
const createOrder = async (
	user,
	items,
	couponCode,
	orderType,
	tableNumber,
	deliveryAddress,
	paymentMethod,
	initialStatus = "pending"
) => {
	try {
		const userId = user._id;
		let orderItems = [];
		let subtotal = 0;

		// VALIDATE & CONVERT ITEMS
		for (const item of items) {
			const menu = await Menu.findOne({ uniCode: item.uniCode });
			if (!menu) throw new Error("Menu item not exists");
			if (!menu.isAvailable) throw new Error("Menu item is unavailable");

			const variant = menu.variants.find((v) => v.size === item.size);
			if (!variant) throw new Error("Invalid Size");
			if (variant.price !== item.priceAtPurchase)
				throw new Error("price mismatch");

			const itemTotal = variant.price * item.quantity;
			subtotal += itemTotal;

			orderItems.push({
				itemId: menu._id,
				quantity: item.quantity,
				size: item.size,
				priceAtPurchase: variant.price,
			});
		}

		/* ------------------  APPLY COUPON ------------------ */
		let coupon = null;

		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode });
			if (!coupon) throw new Error("Invalid coupon");

			const now = Date.now();

			if (coupon.validFrom && now < coupon.validFrom)
				throw new Error("Coupon not active yet");
			if (coupon.validTill && now > coupon.validTill)
				throw new Error("Coupon expired");

			if (
				coupon.validFor === "specific-user" &&
				!coupon.specificUsers.includes(userId)
			)
				throw new Error("Coupon not available for you");

			if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
				throw new Error(`Minimum order value is ${coupon.minOrderValue}`);

			if (coupon.usedCount >= coupon.maxUsage)
				throw new Error("Coupon usage limit reached");

			let usage = user.couponUsage.find(
				(u) => u.couponId.toString() === coupon._id.toString()
			);

			if (usage && usage.usedCount >= coupon.perUserLimit)
				throw new Error("Coupon per-user limit reached");

			// Apply discount
			if (coupon.discountType === "flat") {
				subtotal -= coupon.discountValue;
			} else {
				const discountAmount = (subtotal * coupon.discountValue) / 100;
				const finalDiscount = Math.min(discountAmount, coupon.maxDiscount);
				subtotal -= finalDiscount;
			}

			if (subtotal < 0) subtotal = 0;
		}

		let totalAmount = subtotal;

		const today = dayjs().format("YYYY-MM-DD");

		let counter = await Counter.findOne({ date: today });

		if (!counter) {
			counter = await Counter.create({ date: today, seq: 1 });
		} else {
			counter.seq += 1;
			await counter.save();
		}

		const orderNumber = counter.seq;

		const validPaymentMethod = ["cod", "counter", "online"].includes(
			paymentMethod
		)
			? paymentMethod
			: "cod";

		const newOrder = new Order({
			user: userId,
			items: orderItems,
			coupons: coupon ? coupon._id : null,
			orderType,
			tableNumber,
			deliveryAddress,
			status: initialStatus,
			paymentMethod: validPaymentMethod,
			paymentStatus: validPaymentMethod === "online" ? "initiated" : "pending",
			totalAmount,
			orderNumber,
		});

		await newOrder.save();

		user.pastOrders.push(newOrder._id);

		if (coupon) {
			let usage = user.couponUsage.find(
				(u) => u.couponId.toString() === coupon._id.toString()
			);

			if (usage) usage.usedCount += 1;
			else {
				user.couponUsage.push({
					couponId: coupon._id,
					usedCount: 1,
				});
			}

			coupon.usedCount += 1;
			await coupon.save();
		}

		await user.save();

		return newOrder;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

/* ==========================================================================
   CONTROLLER: Place Order (UPDATED)
   ========================================================================== */
const placeorder = async (req, res) => {
	try {
		let {
			items,
			couponCode,
			orderType,
			tableNumber,
			deliveryAddress,
			paymentMethod,
		} = req.body;

		// 1. CHECK FOR ACTIVE ORDERS FIRST
		// We exclude orders that are completed, cancelled, or rejected.
		const existingActiveOrder = await Order.findOne({
			user: req.user._id,
			status: { $nin: ["completed", "cancelled", "rejected"] },
		});

		if (existingActiveOrder) {
			return res.status(400).json({
				message:
					"You already have an active order. Please wait for it to complete.",
				activeOrderId: existingActiveOrder._id,
			});
		}

		// 2. Validate Request
		if (!items || !Array.isArray(items) || items.length === 0 || !orderType)
			return res.status(400).json({ message: "Missing required fields" });

		if (orderType === "dine-in" && !tableNumber) {
			return res.status(400).json({ message: "Table number is Required" });
		}

		// 3. Table Checks (if dine-in)
		let table = null;
		if (tableNumber) {
			table = await Table.findOne({ tableNumber });
			if (!table) {
				return res
					.status(400)
					.json({ message: "Table number is not accurate" });
			}
			if (table.isDisabled) {
				return res.status(400).json({ message: "Table number is not Active." });
			}
			// Optional: Check if table is already occupied by someone else
			// if (table.currentOrder) { ... }
		}

		if (orderType === "delivery" && !deliveryAddress)
			return res.status(400).json({ message: "Delivery address is required" });

		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// 4. Create Order
		const newOrder = await createOrder(
			user,
			items,
			couponCode,
			orderType,
			tableNumber,
			deliveryAddress,
			paymentMethod,
			"pending"
		);

		// 5. Update Table if needed
		if (table) {
			table.currentOrder = newOrder._id;
			await table.save();
		}

		// 6. Notify Admin
		const io = getIO();
		io.to("admin_room").emit("new_order", newOrder);

		return res.status(200).json({
			message: "Order created",
			order: newOrder,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: error.message || "Server error" });
	}
};

/* ==========================================================================
   OTHER CONTROLLERS (Unchanged)
   ========================================================================== */

const getAllOrders = async (req, res) => {
	try {
		if (!["admin", "chef", "delivery"].includes(req.user.role)) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const orders = await Order.find({})
			.populate("user", "name email")
			.populate("items.itemId", "name image")
			.sort({ createdAt: -1 });

		return res.status(200).json({ orders });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const getOneOrders = async (req, res) => {
	try {
		const { orderId } = req.body;

		if (req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const orders = await Order.findById(orderId)
			.populate("user", "name email")
			.populate("items.itemId", "name image ");

		return res.status(200).json({ orders });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const getLatestOrder = async (req, res) => {
	try {
		const order = await Order.findOne({ user: req.user._id })
			.populate("items.itemId", "name image")
			.sort({ createdAt: -1 });

		if (!order)
			return res.status(200).json({ message: "No active order", order: null });

		return res.status(200).json({ order });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const changeStatus = async (req, res) => {
	try {
		const { status, orderId } = req.body;
		const role = req.user.role;

		if (!status || !orderId)
			return res.status(400).json({ message: "Missing required fields" });

		let order = await Order.findById(orderId).populate(
			"items.itemId",
			"name image"
		);

		if (!order) return res.status(404).json({ message: "Order not found" });

		const ADMIN_RULES = {
			pending: ["accepted", "cancelled"],
			accepted: ["preparing", "cancelled"],
			preparing: ["ready", "cancelled"],
			ready: ["completed", "cancelled"],
			completed: [],
			cancelled: [],
		};

		const CHEF_RULES = {
			accepted: ["preparing"],
			preparing: ["ready"],
		};

		const DELIVERY_RULES = {
			ready: ["completed"],
		};

		let allowed = [];

		if (role === "admin") allowed = ADMIN_RULES[order.status] || [];
		else if (role === "chef") allowed = CHEF_RULES[order.status] || [];
		else if (role === "delivery") allowed = DELIVERY_RULES[order.status] || [];
		else return res.status(401).json({ message: "Not authorized" });

		if (!allowed.includes(status))
			return res
				.status(400)
				.json({ message: `Cannot change ${order.status} → ${status}` });

		order.status = status;
		await order.save();
		if (
			["completed", "cancelled"].includes(order.status) &&
			order.orderType === "dine-in"
		) {
			const table = await Table.findOne({ tableNumber: order.tableNumber });
			if (table) {
				table.currentOrder = null;
				await table.save();
			}
		}

		const io = getIO();
		io.to("admin_room").emit("order_updated", order);
		io.to("chef_room").emit("order_updated", order);
		io.to(`user_${order.user}`).emit("order_updated", order);

		if (order.orderType === "delivery")
			io.to("delivery_room").emit("order_updated", order);

		return res.status(200).json({ message: "Order updated", order });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const setPaymentType = async (req, res) => {
	try {
		const { orderId, paymentType } = req.body;

		if (!orderId || !paymentType)
			return res.status(400).json({ message: "Missing required fields" });

		if (req.user.role !== "admin")
			return res.status(401).json({ message: "Unauthorized" });

		if (!["cash", "upi"].includes(paymentType))
			return res.status(400).json({ message: "Invalid payment type" });

		const order = await Order.findById(orderId);
		if (!order) return res.status(404).json({ message: "Order not found" });

		order.paymentType = paymentType;
		await order.save();

		const io = getIO();
		io.to("admin_room").emit("order_updated", order);

		return res.status(200).json({
			message: "Payment type updated",
			order,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const dineInOrder = async (req, res) => {
	try {
		const { tableNumber, currentOrder } = req.body;

		if (!tableNumber || !currentOrder)
			return res.status(400).json({ message: "Missing Required fields" });

		if (req.user.role !== "admin")
			return res.status(401).json({ message: "Unauthorized" });

		const table = await Table.findOne({ tableNumber });
		if (!table) return res.status(404).json({ message: "Table not found" });

		const user = await User.findById(req.user._id);

		const newOrder = await createOrder(
			user,
			currentOrder.items,
			null,
			"dine-in",
			tableNumber,
			null,
			"counter",
			"accepted"
		);

		// ✅ POPULATE BEFORE EMIT
		const populatedOrder = await Order.findById(newOrder._id)
			.populate("user", "name email")
			.populate("items.itemId", "name image");

		const io = getIO();
		io.to("admin_room").emit("new_order", populatedOrder);
		io.to("chef_room").emit("new_order", populatedOrder);

		table.currentOrder = newOrder._id;
		await table.save();

		return res.status(200).json({
			message: "Table occupied",
			order: populatedOrder,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

const addItemToOrder = async (req, res) => {
	try {
		const { orderId, items } = req.body;

		if (!orderId || !items)
			return res.status(400).json({ message: "Missing required fields" });

		if (req.user.role !== "admin")
			return res.status(401).json({ message: "Unauthorized" });

		const order = await Order.findById(orderId);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (["completed", "cancelled"].includes(order.status))
			return res.status(400).json({ message: "Cannot modify finished order" });

		let newItems = [];

		for (const item of items) {
			const menu = await Menu.findOne({ uniCode: item.uniCode });
			if (!menu) throw new Error("Item does not exist");
			if (!menu.isAvailable) throw new Error("Item unavailable");

			const variant = menu.variants.find((v) => v.size === item.size);
			if (!variant) throw new Error("Invalid size");
			if (variant.price !== item.priceAtPurchase)
				throw new Error("Price mismatch");

			newItems.push({
				itemId: menu._id,
				quantity: item.quantity,
				size: item.size,
				priceAtPurchase: variant.price,
			});
		}

		for (const item of newItems) {
			const existing = order.items.find(
				(i) =>
					i.itemId.toString() === item.itemId.toString() && i.size === item.size
			);

			if (existing) {
				existing.quantity += item.quantity;
			} else {
				order.items.push(item);
			}
		}

		order.totalAmount = order.items.reduce(
			(sum, i) => sum + i.priceAtPurchase * i.quantity,
			0
		);

		await order.save();

		// ✅ POPULATE BEFORE EMIT
		const populatedOrder = await Order.findById(order._id)
			.populate("user", "name email")
			.populate("items.itemId", "name image");

		const io = getIO();
		io.to("chef_room").emit("order_updated", populatedOrder);
		io.to("admin_room").emit("order_updated", populatedOrder);

		return res.status(200).json({
			message: "Items added successfully",
			order: populatedOrder,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

const closeTable = async (req, res) => {
	try {
		const { tableNumber } = req.body;

		if (!tableNumber)
			return res.status(400).json({ message: "Table number is required" });

		if (req.user.role !== "admin")
			return res.status(401).json({ message: "Unauthorized" });

		const table = await Table.findOne({ tableNumber });
		if (!table) return res.status(404).json({ message: "Table not found" });

		if (!table.currentOrder)
			return res
				.status(400)
				.json({ message: "This table has no active order" });

		const order = await Order.findById(table.currentOrder);
		if (!order) return res.status(404).json({ message: "Order not found" });

		order.status = "completed";
		order.paymentStatus = "paid";
		await order.save();

		table.currentOrder = null;
		await table.save();

		const io = getIO();
		io.to("admin_room").emit("order_updated", order);
		io.to("chef_room").emit("order_updated", order);

		return res.status(200).json({
			message: "Table closed successfully",
			finalBill: {
				orderId: order._id,
				total: order.totalAmount,
				items: order.items,
				paymentMethod: order.paymentMethod,
				paymentType: order.paymentType || null,
			},
			tableStatus: "free",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: error.message || "Server error",
		});
	}
};

const getUserOrders = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 5;
		const skip = (page - 1) * limit;

		const orders = await Order.find({ user: req.user._id })
			.populate("items.itemId", "name image")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Order.countDocuments({ user: req.user._id });

		return res.status(200).json({
			orders,
			pagination: {
				page,
				limit,
				total,
				hasMore: skip + orders.length < total,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

export {
	placeorder,
	changeStatus,
	dineInOrder,
	addItemToOrder,
	closeTable,
	setPaymentType,
	getAllOrders,
	getLatestOrder,
	getOneOrders,
	getUserOrders,
};
