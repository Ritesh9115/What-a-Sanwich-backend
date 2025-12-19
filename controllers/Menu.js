import { Menu } from "../models/Menu.js";
import dotenv from "dotenv";
import { Category } from "../models/Category.js";

dotenv.config();

/* -------------------------------------------------
   Helper: normalize variants input
--------------------------------------------------- */
const normalizeVariants = (variants, price) => {
	if (typeof variants === "string") {
		variants = JSON.parse(variants);
	}

	if (Array.isArray(variants) && variants.length > 0) {
		return variants;
	}

	if (price == null) {
		throw new Error("Price is required when no variants provided");
	}

	return [{ size: "Regular", price }];
};

/* -------------------------------------------------
   ADD MENU
--------------------------------------------------- */
const addMenu = async (req, res) => {
	try {
		const {
			uniCode,
			name,
			description,
			category,
			subCategory,
			variants,
			price,
			isVeg,
			isAvailable,
			preparationTime,
			discountPrice,
			rating,
		} = req.body;

		if (!uniCode || !name || !description || !category) {
			return res.status(400).json({ message: "Required fields missing" });
		}

		// ✅ validate category by NAME (string)
		const cat = await Category.findOne({
			name: category,
			isActive: true,
		});

		if (!cat) {
			return res.status(400).json({
				message: "Invalid or inactive category",
			});
		}

		const finalVariants = normalizeVariants(variants, price);

		const newMenu = new Menu({
			uniCode,
			name,
			image: req.file?.path,
			description,
			category, // ✅ STRING ONLY
			subCategory,
			variants: finalVariants,
			isVeg,
			isAvailable,
			preparationTime,
			discountPrice,
			rating,
		});

		await newMenu.save();

		return res.status(201).json({
			message: "Menu Added",
			menu: newMenu,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: error.message });
	}
};

/* -------------------------------------------------
   UPDATE MENU
--------------------------------------------------- */
const updateMenu = async (req, res) => {
	try {
		const {
			uniCode,
			name,
			description,
			category,
			subCategory,
			variants,
			price,
			isVeg,
			isAvailable,
			preparationTime,
			discountPrice,
			rating,
		} = req.body;

		const menu = await Menu.findOne({ uniCode });
		if (!menu) {
			return res.status(404).json({ message: "Menu not found" });
		}

		// ✅ validate category by NAME (string)
		if (category) {
			const cat = await Category.findOne({
				name: category,
				isActive: true,
			});

			if (!cat) {
				return res.status(400).json({
					message: "Invalid or inactive category",
				});
			}

			menu.category = category;
		}

		if (variants || price) {
			menu.variants = normalizeVariants(variants, price);
		}

		if (req.file?.path) {
			menu.image = req.file.path;
		}

		// ✅ SAFE FIELD ASSIGN (NO Object.assign)
		if (name) menu.name = name;
		if (description) menu.description = description;
		if (subCategory !== undefined) menu.subCategory = subCategory;
		if (isVeg !== undefined) menu.isVeg = isVeg;
		if (isAvailable !== undefined) menu.isAvailable = isAvailable;
		if (preparationTime !== undefined) menu.preparationTime = preparationTime;
		if (discountPrice !== undefined) menu.discountPrice = discountPrice;
		if (rating !== undefined) menu.rating = rating;

		await menu.save();

		return res.status(200).json({
			message: "Menu Updated",
			menu,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   SHOW ONE MENU
--------------------------------------------------- */
const showOneMenu = async (req, res) => {
	try {
		const { _id } = req.body;

		const menu = await Menu.findById(_id);
		if (!menu) {
			return res.status(404).json({ message: "Menu not found" });
		}

		return res.status(200).json({ menu });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   DELETE MENU
--------------------------------------------------- */
const deleteMenu = async (req, res) => {
	try {
		const { uniCode } = req.body;

		if (!uniCode) {
			return res.status(400).json({ message: "uniCode required" });
		}

		const deleted = await Menu.findOneAndDelete({ uniCode });
		if (!deleted) {
			return res.status(404).json({ message: "Menu not found" });
		}

		return res.status(200).json({
			message: "Menu deleted",
			deleted,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   SHOW MENU (STRING CATEGORY FILTER)
--------------------------------------------------- */
const showMenu = async (req, res) => {
	try {
		// get only active categories
		const activeCategories = await Category.find(
			{ isActive: true },
			{ name: 1 }
		);

		const activeCategoryNames = activeCategories.map((c) => c.name);

		// show only menu whose category is ACTIVE
		const menu = await Menu.find({
			category: { $in: activeCategoryNames },
			isAvailable: true,
		}).sort({ createdAt: -1 });

		return res.status(200).json({ menu });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};
export const toggleFeatured = async (req, res) => {
	try {
		const { uniCode } = req.body;

		const menu = await Menu.findOne({ uniCode });
		if (!menu) {
			return res.status(404).json({ message: "Menu not found" });
		}

		menu.isFeatured = !menu.isFeatured;
		await menu.save();

		res.status(200).json({
			message: "Featured status updated",
			menu,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
export const getFeaturedMenu = async (req, res) => {
	try {
		// only active categories
		const activeCategories = await Category.find(
			{ isActive: true },
			{ name: 1 }
		);

		const activeCategoryNames = activeCategories.map((c) => c.name);

		const menu = await Menu.find({
			isFeatured: true,
			isAvailable: true,
			category: { $in: activeCategoryNames },
		}).sort({ updatedAt: -1 });

		return res.status(200).json({ menu });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   SEARCH MENU
--------------------------------------------------- */
const searchMenu = async (req, res) => {
	try {
		const { query } = req.query;

		if (!query) {
			return res.status(400).json({ message: "Search query required" });
		}

		const menu = await Menu.find({
			name: { $regex: query, $options: "i" },
		})
			.sort({ name: 1 })
			.limit(5);

		return res.status(200).json({ suggestions: menu });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   TOGGLE AVAILABILITY
--------------------------------------------------- */
const toggleAvailability = async (req, res) => {
	try {
		const { uniCode, isAvailable } = req.body;

		if (!uniCode || typeof isAvailable !== "boolean") {
			return res.status(400).json({ message: "Invalid values" });
		}

		const menu = await Menu.findOne({ uniCode });
		if (!menu) {
			return res.status(404).json({ message: "Menu item not found" });
		}

		menu.isAvailable = isAvailable;
		await menu.save();

		return res.status(200).json({
			message: `Item is now ${isAvailable ? "Available" : "Unavailable"}`,
			menu,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};
const showMenuForAdmin = async (req, res) => {
	try {
		const menu = await Menu.find().sort({ createdAt: -1 });
		return res.status(200).json({ menu });
	} catch (err) {
		return res.status(500).json({ message: "Server error" });
	}
};

export {
	addMenu,
	updateMenu,
	showMenuForAdmin,
	deleteMenu,
	showMenu,
	searchMenu,
	toggleAvailability,
	showOneMenu,
};
