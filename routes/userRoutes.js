import { Router } from "express";
import {
	placeorder,
	getLatestOrder,
	getUserOrders,
} from "../controllers/Order.js";
import { User } from "../models/User.js";
import {
	register,
	verifyEmail,
	resendOtp,
	changePassword,
	forgotPassword,
	verifyForgotOtp,
	resetPassword,
	login,
	loginWithOtp,
	verifyLoginWithOtp,
	logout,
} from "../controllers/Auth.js";
import { getOneCategory, getAllCategories } from "../controllers/category.js";
import {
	addAddress,
	removeAddress,
	updateAddress,
	listAllAddress,
} from "../controllers/Address.js";
import {
	updateUser,
	fetchUserDetails,
	updateProfilePic,
	requestEmailChange,
	verifyEmailChange,
	deleteAccount,
} from "../controllers/User.js";
import { isLogin } from "../middleware/jwtVerification.js";
import { showMenu, searchMenu, getFeaturedMenu } from "../controllers/Menu.js";
import { listActiveProfiles, setProfilePic } from "../controllers/Profile.js";

const router = Router();

router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyForgotOtp", verifyForgotOtp);
router.post("/resetPassword", resetPassword);
router.post("/login", login);
router.post("/loginWithOtp", loginWithOtp);
router.post("/verifyLoginWithOtp", verifyLoginWithOtp);
router.get("/showMenu", showMenu);
router.get("/searchMenu", searchMenu);
router.get("/featured-menu", getFeaturedMenu);
router.post(
	"/addAddress",
	isLogin(["customer", "admin", "chef", "delivery"]),
	addAddress
);
router.post(
	"/getOneCategory",
	isLogin(["customer", "admin", "chef", "delivery"]),
	getOneCategory
);
router.post("/getAllCategories", getAllCategories);
router.post(
	"/removeAddress",
	isLogin(["customer", "admin", "chef", "delivery"]),
	removeAddress
);
router.post(
	"/updateAddress",
	isLogin(["customer", "admin", "chef", "delivery"]),
	updateAddress
);
router.post(
	"/listAllAddress",
	isLogin(["customer", "admin", "chef", "delivery"]),
	listAllAddress
);
router.get(
	"/my-order",
	isLogin(["customer", "admin", "chef", "delivery"]),
	getLatestOrder
);

router.get(
	"/orders",
	isLogin(["customer", "admin", "chef", "delivery"]),
	getUserOrders
);
router.post(
	"/listActiveProfiles",
	isLogin(["customer", "admin", "chef", "delivery"]),
	listActiveProfiles
);

router.post(
	"/setProfilePic",
	isLogin(["customer", "admin", "chef", "delivery"]),
	setProfilePic
);

router.post(
	"/placeorder",
	isLogin(["customer", "admin", "chef", "delivery"]),
	placeorder
);
router.post(
	"/updateUser",
	isLogin(["customer", "admin", "chef", "delivery"]),
	updateUser
);
router.post(
	"/updateProfilePic",
	isLogin(["customer", "admin", "chef", "delivery"]),
	updateProfilePic
);
router.post(
	"/requestEmailChange",
	isLogin(["customer", "admin", "chef", "delivery"]),
	requestEmailChange
);
router.post(
	"/fetchUserDetails",
	isLogin(["customer", "admin", "chef", "delivery"]),
	fetchUserDetails
);
router.post(
	"/verifyEmailChange",
	isLogin(["customer", "admin", "chef", "delivery"]),
	verifyEmailChange
);
router.post(
	"/deleteAccount",
	isLogin(["customer", "admin", "chef", "delivery"]),
	deleteAccount
);

router.post(
	"/changePassword",
	isLogin(["customer", "admin", "chef", "delivery"]),
	changePassword
);
router.post(
	"/logout",
	isLogin(["customer", "admin", "chef", "delivery"]),
	logout
);
router.get(
	"/me",
	isLogin(["customer", "admin", "chef", "delivery"]),
	async (req, res) => {
		try {
			const user = await User.findById(req.user.id).select("-password");
			if (!user) return res.status(404).json({ message: "User not found" });

			res.json({ user });
		} catch (err) {
			res.status(500).json({ message: "Server error" });
		}
	}
);

export default router;
