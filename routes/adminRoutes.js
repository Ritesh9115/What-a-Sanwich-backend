import { Router } from "express";
import { Order } from "../models/Order.js";
import {
	addMenu,
	updateMenu,
	deleteMenu,
	toggleAvailability,
	showOneMenu,
	toggleFeatured,
	showMenuForAdmin,
} from "../controllers/Menu.js";
import { upload } from "../middleware/upload.js";
import {
	deleteCategory,
	toggleCategoryStatus,
	updateCategory,
	getOneCategory,
	getAllCategories,
	createCategory,
} from "../controllers/category.js";

import {
	changeStatus,
	dineInOrder,
	addItemToOrder,
	closeTable,
	getAllOrders,
	getOneOrders,
} from "../controllers/Order.js";
import {
	todayStats,
	yearlyStats,
	monthlyStats,
	rangeStats,
	dailyItemStats,
} from "../controllers/adminStats.js";
import {
	addCoupon,
	deleteCoupon,
	updateCoupon,
	listAllCoupon,
} from "../controllers/Coupons.js";
import {
	addProfilePic,
	listAllProfiles,
	deleteProfile,
	toggleProfileStatus,
} from "../controllers/Profile.js";
import {
	deleteUser,
	chngRole,
	showAllUsers,
	searchByEmail,
} from "../controllers/Manage.js";
import {
	addTable,
	removeTable,
	fetchOneTable,
	listTables,
	enableTable,
	disableTable,
} from "../controllers/Table.js";
import { isLogin } from "../middleware/jwtVerification.js";

const router = Router();

// Ensure req.body is initialized even if the client sends no payload (prevents crashes on GET/DELETE/PATCH)
router.use((req, res, next) => {
	if (!req.body) req.body = {};
	next();
});

const adminOnly = isLogin(["admin"]);
const adminOrChef = isLogin(["admin", "chef"]);

/* ─────────────────────────────────────────────────
   MENU
───────────────────────────────────────────────── */

// GET /api/v1/admin/menu
router.get("/menu", adminOnly, showMenuForAdmin);
// Legacy alias
router.get("/showMenu", adminOnly, showMenuForAdmin);

// GET /api/v1/admin/menu/:id
router.get("/menu/:id", adminOnly, (req, res, next) => {
	req.body._id = req.params.id;
	next();
}, showOneMenu);
// Legacy alias
router.post("/showOneMenu", adminOnly, showOneMenu);

// POST /api/v1/admin/menu (add)
router.post("/menu", upload.single("image"), adminOnly, addMenu);
// Legacy alias
router.post("/addMenu", upload.single("image"), adminOnly, addMenu);

// PATCH /api/v1/admin/menu/:uniCode (update)
router.patch("/menu/:uniCode", upload.single("image"), adminOnly, (req, res, next) => {
	if (!req.body.uniCode) req.body.uniCode = req.params.uniCode;
	next();
}, updateMenu);
// Legacy alias
router.post("/updateMenu", upload.single("image"), adminOnly, updateMenu);

// DELETE /api/v1/admin/menu/:uniCode
router.delete("/menu/:uniCode", adminOnly, (req, res, next) => {
	req.body.uniCode = req.params.uniCode;
	next();
}, deleteMenu);
// Legacy alias
router.post("/deleteMenu", adminOnly, deleteMenu);

// PATCH /api/v1/admin/menu/:uniCode/availability
router.patch("/menu/:uniCode/availability", adminOnly, (req, res, next) => {
	if (!req.body.uniCode) req.body.uniCode = req.params.uniCode;
	next();
}, toggleAvailability);
// Legacy alias
router.post("/toggleAvailability", adminOnly, toggleAvailability);

// PATCH /api/v1/admin/menu/:uniCode/featured
router.patch("/menu/:uniCode/featured", adminOnly, (req, res, next) => {
	if (!req.body.uniCode) req.body.uniCode = req.params.uniCode;
	next();
}, toggleFeatured);
// Legacy alias
router.post("/toggleFeatured", adminOnly, toggleFeatured);

/* ─────────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────────── */

// GET /api/v1/admin/categories
router.get("/categories", adminOnly, (req, res, next) => {
	// Admin sees all; set req.user role so getAllCategories returns all
	next();
}, getAllCategories);

// GET /api/v1/admin/categories/:id
router.get("/categories/:id", adminOnly, (req, res, next) => {
	req.body.categoryId = req.params.id;
	next();
}, getOneCategory);

// POST /api/v1/admin/categories
router.post("/categories", upload.single("image"), adminOnly, createCategory);
// Legacy alias
router.post("/createCategory", upload.single("image"), adminOnly, createCategory);

// PATCH /api/v1/admin/categories/:id
router.patch("/categories/:id", upload.single("image"), adminOnly, (req, res, next) => {
	if (!req.body.categoryId) req.body.categoryId = req.params.id;
	next();
}, updateCategory);
// Legacy alias
router.post("/updateCategory", upload.single("image"), adminOnly, updateCategory);

// PATCH /api/v1/admin/categories/:id/status
router.patch("/categories/:id/status", adminOnly, (req, res, next) => {
	if (!req.body.categoryId) req.body.categoryId = req.params.id;
	next();
}, toggleCategoryStatus);
// Legacy alias
router.post("/toggleCategoryStatus", adminOnly, toggleCategoryStatus);

// DELETE /api/v1/admin/categories/:id
router.delete("/categories/:id", adminOnly, (req, res, next) => {
	req.body.categoryId = req.params.id;
	next();
}, deleteCategory);
// Legacy alias
router.post("/deleteCategory", adminOnly, deleteCategory);

/* ─────────────────────────────────────────────────
   ORDERS
───────────────────────────────────────────────── */

// GET /api/v1/admin/orders
router.get("/orders", adminOrChef, getAllOrders);
// Legacy alias
router.post("/orders", adminOrChef, getAllOrders);

// GET /api/v1/admin/orders/:id
router.get("/orders/:id", adminOnly, (req, res, next) => {
	req.body.orderId = req.params.id;
	next();
}, getOneOrders);
// Legacy alias
router.post("/getOneOrders", adminOnly, getOneOrders);

// PATCH /api/v1/admin/orders/:id/status
router.patch("/orders/:id/status", adminOrChef, (req, res, next) => {
	if (!req.body.orderId) req.body.orderId = req.params.id;
	next();
}, changeStatus);
// Legacy alias
router.post("/changeStatus", adminOrChef, changeStatus);

// POST /api/v1/admin/orders/dine-in
router.post("/orders/dine-in", adminOnly, dineInOrder);
// Legacy alias
router.post("/dineInOrder", adminOnly, dineInOrder);

// POST /api/v1/admin/orders/:id/add-items
router.post("/orders/:id/add-items", adminOnly, (req, res, next) => {
	if (!req.body.orderId) req.body.orderId = req.params.id;
	next();
}, addItemToOrder);
// Legacy alias
router.post("/addItemToOrder", adminOnly, addItemToOrder);

// POST /api/v1/admin/tables/:number/close
router.post("/tables/:number/close", adminOnly, (req, res, next) => {
	if (!req.body.tableNumber) req.body.tableNumber = parseInt(req.params.number);
	next();
}, closeTable);
// Legacy alias
router.post("/closeTable", adminOnly, closeTable);

// POST /api/v1/admin/users/:id/orders (user order history)
router.get("/users/:id/orders", adminOnly, async (req, res) => {
	try {
		const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
		const formatted = orders.map((o) => ({
			...o._doc,
			placedDate: o.createdAt,
			day: new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "long" }),
		}));
		return res.status(200).json({ orders: formatted });
	} catch (err) {
		return res.status(500).json({ message: "Server error" });
	}
});
// Legacy alias
router.post("/userOrders", adminOnly, async (req, res) => {
	try {
		const { userId } = req.body;
		const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
		const formatted = orders.map((o) => ({
			...o._doc,
			placedDate: o.createdAt,
			day: new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "long" }),
		}));
		return res.status(200).json({ orders: formatted });
	} catch (err) {
		return res.status(500).json({ message: "Server error" });
	}
});

/* ─────────────────────────────────────────────────
   STATS
───────────────────────────────────────────────── */

// GET /api/v1/admin/stats/today
router.get("/stats/today", adminOnly, todayStats);
// Legacy alias
router.post("/todayStats", adminOnly, todayStats);

// GET /api/v1/admin/stats/monthly?month=&year=
router.get("/stats/monthly", adminOnly, monthlyStats);
// Legacy alias
router.post("/monthlyStats", adminOnly, monthlyStats);

// GET /api/v1/admin/stats/yearly?year=
router.get("/stats/yearly", adminOnly, yearlyStats);
// Legacy alias
router.post("/yearlyStats", adminOnly, yearlyStats);

// GET /api/v1/admin/stats/daily-items
router.get("/stats/daily-items", adminOnly, dailyItemStats);
// Legacy alias
router.post("/dailyItemStats", adminOnly, dailyItemStats);

// GET /api/v1/admin/stats/range?from=&to=
router.get("/stats/range", adminOnly, (req, res, next) => {
	// rangeStats reads req.body.from/to for the legacy path; support query params too
	if (req.query.from) req.body.from = req.query.from;
	if (req.query.to) req.body.to = req.query.to;
	next();
}, rangeStats);
// Legacy alias
router.post("/rangeStats", adminOnly, rangeStats);

/* ─────────────────────────────────────────────────
   COUPONS
───────────────────────────────────────────────── */

// GET /api/v1/admin/coupons
router.get("/coupons", adminOnly, listAllCoupon);
// Legacy alias
router.post("/listAllCoupon", adminOnly, listAllCoupon);

// POST /api/v1/admin/coupons
router.post("/coupons", adminOnly, addCoupon);
// Legacy alias
router.post("/addCoupon", adminOnly, addCoupon);

// PATCH /api/v1/admin/coupons/:id
router.patch("/coupons/:id", adminOnly, (req, res, next) => {
	if (!req.body.couponId) req.body.couponId = req.params.id;
	next();
}, updateCoupon);
// Legacy alias
router.post("/updateCoupon", adminOnly, updateCoupon);

// DELETE /api/v1/admin/coupons/:id
router.delete("/coupons/:id", adminOnly, (req, res, next) => {
	req.body.couponId = req.params.id;
	next();
}, deleteCoupon);
// Legacy alias
router.post("/deleteCoupon", adminOnly, deleteCoupon);

/* ─────────────────────────────────────────────────
   USERS (admin management)
───────────────────────────────────────────────── */

// GET /api/v1/admin/users
router.get("/users", adminOnly, showAllUsers);
// Legacy alias
router.post("/showAllUsers", adminOnly, showAllUsers);

// POST /api/v1/admin/users/search
// Email is sent in the request body to prevent information disclosure in URL.
router.post("/users/search", adminOnly, searchByEmail);
// Legacy alias
router.post("/searchByEmail", adminOnly, searchByEmail);

// PATCH /api/v1/admin/users/:id/role
router.patch("/users/:id/role", adminOnly, (req, res, next) => {
	if (!req.body.userId) req.body.userId = req.params.id;
	next();
}, chngRole);
// Legacy alias
router.post("/chngRole", adminOnly, chngRole);

// DELETE /api/v1/admin/users/:id
router.delete("/users/:id", adminOnly, (req, res, next) => {
	req.body.userId = req.params.id;
	next();
}, deleteUser);
// Legacy alias
router.post("/deleteUser", adminOnly, deleteUser);

/* ─────────────────────────────────────────────────
   PROFILE PICTURES
───────────────────────────────────────────────── */

// GET /api/v1/admin/profiles
router.get("/profiles", adminOnly, listAllProfiles);
// Legacy alias
router.post("/listAllProfiles", adminOnly, listAllProfiles);

// POST /api/v1/admin/profiles
router.post("/profiles", upload.single("image"), adminOnly, addProfilePic);
// Legacy alias
router.post("/addProfilePic", upload.single("image"), adminOnly, addProfilePic);

// PATCH /api/v1/admin/profiles/:id/status
router.patch("/profiles/:id/status", adminOnly, (req, res, next) => {
	if (!req.body.profileId) req.body.profileId = req.params.id;
	next();
}, toggleProfileStatus);
// Legacy alias
router.post("/toggleProfileStatus", adminOnly, toggleProfileStatus);

// DELETE /api/v1/admin/profiles/:id
router.delete("/profiles/:id", adminOnly, (req, res, next) => {
	req.body.profileId = req.params.id;
	next();
}, deleteProfile);
// Legacy alias
router.post("/deleteProfile", adminOnly, deleteProfile);

/* ─────────────────────────────────────────────────
   TABLES
───────────────────────────────────────────────── */

// GET /api/v1/admin/tables
router.get("/tables", adminOnly, listTables);
// Legacy alias
router.post("/listTables", adminOnly, listTables);

// GET /api/v1/admin/tables/:number
router.get("/tables/:number", adminOnly, (req, res, next) => {
	req.body.tableNumber = parseInt(req.params.number);
	next();
}, fetchOneTable);
// Legacy alias
router.post("/fetchOneTable", adminOnly, fetchOneTable);

// POST /api/v1/admin/tables
router.post("/tables", adminOnly, addTable);
// Legacy alias
router.post("/addTable", adminOnly, addTable);

// DELETE /api/v1/admin/tables/:number
router.delete("/tables/:number", adminOnly, (req, res, next) => {
	req.body.tableNumber = parseInt(req.params.number);
	next();
}, removeTable);
// Legacy alias
router.post("/removeTable", adminOnly, removeTable);

// PATCH /api/v1/admin/tables/:number/enable
router.patch("/tables/:number/enable", adminOnly, (req, res, next) => {
	req.body.tableNumber = parseInt(req.params.number);
	next();
}, enableTable);
// Legacy alias
router.post("/enableTable", adminOnly, enableTable);

// PATCH /api/v1/admin/tables/:number/disable
router.patch("/tables/:number/disable", adminOnly, (req, res, next) => {
	req.body.tableNumber = parseInt(req.params.number);
	next();
}, disableTable);
// Legacy alias
router.post("/disableTable", adminOnly, disableTable);

export default router;
