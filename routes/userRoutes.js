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
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { showMenu, searchMenu, getFeaturedMenu } from "../controllers/Menu.js";
import { listActiveProfiles, setProfilePic } from "../controllers/Profile.js";

const router = Router();

/* ─────────────────────────────────────────────────
   AUTH (rate-limited)
───────────────────────────────────────────────── */
router.post("/register", authLimiter, register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-forgot-otp", authLimiter, verifyForgotOtp);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/login", authLimiter, login);
router.post("/login-with-otp", authLimiter, loginWithOtp);
router.post("/verify-login-with-otp", authLimiter, verifyLoginWithOtp);
router.post("/logout", isLogin([]), logout);

/* ─────────────────────────────────────────────────
   LEGACY AUTH ALIASES (kept for backward compat while frontend migrates)
───────────────────────────────────────────────── */
router.post("/verifyEmail", authLimiter, verifyEmail);
router.post("/resendOtp", authLimiter, resendOtp);
router.post("/forgotPassword", authLimiter, forgotPassword);
router.post("/verifyForgotOtp", authLimiter, verifyForgotOtp);
router.post("/resetPassword", authLimiter, resetPassword);
router.post("/loginWithOtp", authLimiter, loginWithOtp);
router.post("/verifyLoginWithOtp", authLimiter, verifyLoginWithOtp);

/* ─────────────────────────────────────────────────
   PUBLIC — MENU & CATEGORIES
───────────────────────────────────────────────── */
router.get("/showMenu", showMenu);
router.get("/searchMenu", searchMenu);
router.get("/featured-menu", getFeaturedMenu);
router.get("/categories", getAllCategories);

/* ─────────────────────────────────────────────────
   AUTHENTICATED USER — profile & account
───────────────────────────────────────────────── */
const auth = isLogin(["customer", "admin", "chef", "delivery"]);

// GET /api/v1/users/me — current user (used by AuthContext on load)
router.get("/me", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.select("-password")
			.populate({ path: "profilePic", select: "name pictureUrl" });
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		res.json({ success: true, user });
	} catch {
		res.status(500).json({ success: false, message: "Server error" });
	}
});

// GET /api/v1/users/me/details — full profile details
router.get("/me/details", auth, fetchUserDetails);
// Legacy alias
router.post("/fetchUserDetails", auth, fetchUserDetails);

// PATCH /api/v1/users/me — update name/phone
router.patch("/me", auth, updateUser);
// Legacy alias
router.post("/updateUser", auth, updateUser);

// PATCH /api/v1/users/me/profile-pic
router.patch("/me/profile-pic", auth, updateProfilePic);
// Legacy alias
router.post("/updateProfilePic", auth, updateProfilePic);

// DELETE /api/v1/users/me — soft-delete account
router.delete("/me", auth, deleteAccount);
// Legacy alias
router.post("/deleteAccount", auth, deleteAccount);

// POST /api/v1/users/change-password
router.post("/change-password", auth, changePassword);
// Legacy alias
router.post("/changePassword", auth, changePassword);

// POST /api/v1/users/request-email-change
router.post("/request-email-change", auth, requestEmailChange);
// Legacy alias
router.post("/requestEmailChange", auth, requestEmailChange);

// POST /api/v1/users/verify-email-change
router.post("/verify-email-change", auth, verifyEmailChange);
// Legacy alias
router.post("/verifyEmailChange", auth, verifyEmailChange);

/* ─────────────────────────────────────────────────
   AUTHENTICATED USER — addresses
───────────────────────────────────────────────── */

// GET /api/v1/users/addresses
router.get("/addresses", auth, listAllAddress);
// Legacy alias
router.post("/listAllAddress", auth, listAllAddress);

// POST /api/v1/users/addresses
router.post("/addresses", auth, addAddress);
// Legacy alias
router.post("/addAddress", auth, addAddress);

// PATCH /api/v1/users/addresses/:id
router.patch("/addresses/:id", auth, (req, res, next) => {
	req.body.addressID = req.params.id;
	next();
}, updateAddress);
// Legacy alias (uses body addressID)
router.post("/updateAddress", auth, updateAddress);

// DELETE /api/v1/users/addresses/:id
router.delete("/addresses/:id", auth, (req, res, next) => {
	req.body.addressID = req.params.id;
	next();
}, removeAddress);
// Legacy alias
router.post("/removeAddress", auth, removeAddress);

/* ─────────────────────────────────────────────────
   AUTHENTICATED USER — categories
───────────────────────────────────────────────── */

// GET /api/v1/users/categories/:id
router.get("/categories/:id", auth, (req, res, next) => {
	req.body.categoryId = req.params.id;
	next();
}, getOneCategory);
// Legacy alias
router.post("/getOneCategory", auth, getOneCategory);

// POST /api/v1/users/getAllCategories — legacy public alias kept
router.post("/getAllCategories", getAllCategories);

/* ─────────────────────────────────────────────────
   AUTHENTICATED USER — profile pictures
───────────────────────────────────────────────── */

// GET /api/v1/users/profiles
router.get("/profiles", auth, listActiveProfiles);
// Legacy alias
router.post("/listActiveProfiles", auth, listActiveProfiles);

// POST /api/v1/users/profiles/set
router.post("/profiles/set", auth, setProfilePic);
// Legacy alias
router.post("/setProfilePic", auth, setProfilePic);

/* ─────────────────────────────────────────────────
   AUTHENTICATED USER — orders
───────────────────────────────────────────────── */

// GET /api/v1/users/my-order
router.get("/my-order", auth, getLatestOrder);

// GET /api/v1/users/orders
router.get("/orders", auth, getUserOrders);

// POST /api/v1/users/orders (place order)
router.post("/orders", auth, placeorder);
// Legacy alias
router.post("/placeorder", auth, placeorder);

export default router;
