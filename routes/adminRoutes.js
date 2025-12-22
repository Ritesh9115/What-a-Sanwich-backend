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
	setPaymentType,
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

router.get("/showMenu", isLogin(["admin"]), showMenuForAdmin);
// router.post("/addMenu", upload.single("image"), isLogin(["admin"]), addMenu);
router.post("/addMenu", upload.single("image"), isLogin(["admin"]), addMenu);
router.post(
	"/updateMenu",
	upload.single("image"),
	isLogin(["admin"]),
	updateMenu
);
router.post("/dailyItemStats", isLogin(["admin"]), dailyItemStats);
router.post(
	"/createCategory",
	upload.single("image"),
	isLogin(["admin"]),
	createCategory
);
router.post(
	"/updateCategory",
	upload.single("image"),
	isLogin(["admin"]),
	updateCategory
);
router.post("/toggleCategoryStatus", isLogin(["admin"]), toggleCategoryStatus);
router.post("/deleteCategory", isLogin(["admin"]), deleteCategory);
router.post("/userOrders", isLogin(["admin"]), async (req, res) => {
	try {
		const { userId } = req.body;

		const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

		const formatted = orders.map((o) => ({
			...o._doc,
			placedDate: o.createdAt, // raw date
			day: new Date(o.createdAt).toLocaleDateString("en-US", {
				weekday: "long",
			}), // Monday etc.
		}));

		return res.status(200).json({ orders: formatted });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
});

router.post("/toggleFeatured", isLogin(["admin"]), toggleFeatured);
router.post("/showOneMenu", isLogin(["admin"]), showOneMenu);
router.post("/deleteMenu", isLogin(["admin"]), deleteMenu);
router.post("/toggleAvailability", isLogin(["admin"]), toggleAvailability);
router.post("/changeStatus", isLogin(["admin", "chef"]), changeStatus);
router.post("/orders", isLogin(["admin", "chef"]), getAllOrders);
router.post("/dineInOrder", isLogin(["admin"]), dineInOrder);
router.post("/addItemToOrder", isLogin(["admin"]), addItemToOrder);
router.post("/closeTable", isLogin(["admin"]), closeTable);
router.post("/getOneOrders", isLogin(["admin"]), getOneOrders);
router.post("/setPaymentType", isLogin(["admin"]), setPaymentType);
router.post("/todayStats", isLogin(["admin"]), todayStats);
router.post("/yearlyStats", isLogin(["admin"]), yearlyStats);
router.post("/monthlyStats", isLogin(["admin"]), monthlyStats);
router.post("/rangeStats", isLogin(["admin"]), rangeStats);
router.post("/addCoupon", isLogin(["admin"]), addCoupon);
router.post("/deleteCoupon", isLogin(["admin"]), deleteCoupon);
router.post("/updateCoupon", isLogin(["admin"]), updateCoupon);
router.post("/listAllCoupon", isLogin(["admin"]), listAllCoupon);
router.post("/deleteUser", isLogin(["admin"]), deleteUser);
router.post("/chngRole", isLogin(["admin"]), chngRole);
router.post("/showAllUsers", isLogin(["admin"]), showAllUsers);
router.post("/searchByEmail", isLogin(["admin"]), searchByEmail);
router.post(
	"/addProfilePic",
	upload.single("image"),
	isLogin(["admin"]),
	addProfilePic
);
router.post("/toggleProfileStatus", isLogin(["admin"]), toggleProfileStatus);
router.post("/deleteProfile", isLogin(["admin"]), deleteProfile);
router.post("/listAllProfiles", isLogin(["admin"]), listAllProfiles);
router.post("/addTable", isLogin(["admin"]), addTable);
router.post("/removeTable", isLogin(["admin"]), removeTable);
router.post("/listTables", isLogin(["admin"]), listTables);
router.post("/enableTable", isLogin(["admin"]), enableTable);
router.post("/disableTable", isLogin(["admin"]), disableTable);
router.post("/fetchOneTable", isLogin(["admin"]), fetchOneTable);

export default router;
