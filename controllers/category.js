import { Category } from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import slugify from "slugify";

/* -------------------------------------------------
   CREATE CATEGORY
--------------------------------------------------- */
export const createCategory = async (req, res) => {
	try {
		const { name, icon } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Category name is required" });
		}

		const exists = await Category.findOne({ name });
		if (exists) {
			return res.status(400).json({ message: "Category already exists" });
		}

		const category = await Category.create({
			name,
			slug: slugify(name, { lower: true }),
			icon: icon || "restaurant",
			isActive: true,
			image: req.file
				? {
						url: req.file.path,
						public_id: req.file.filename,
				  }
				: null,
		});

		return res.status(201).json({ category });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   GET ALL CATEGORIES
   - Admin → all
   - User  → only active
--------------------------------------------------- */
export const getAllCategories = async (req, res) => {
	try {
		const filter = req.user?.role === "admin" ? {} : { isActive: true };

		const categories = await Category.find(filter).sort({ createdAt: 1 });
		return res.status(200).json({ categories });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   GET ONE CATEGORY (BY ID – ADMIN USE)
--------------------------------------------------- */
export const getOneCategory = async (req, res) => {
	try {
		const { categoryId } = req.body;

		if (!categoryId) {
			return res.status(400).json({ message: "Category ID required" });
		}

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		return res.status(200).json({ category });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   UPDATE CATEGORY
--------------------------------------------------- */
export const updateCategory = async (req, res) => {
	try {
		const { categoryId, name, icon } = req.body;

		if (!categoryId) {
			return res.status(400).json({ message: "Category ID required" });
		}

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		if (name && name !== category.name) {
			const exists = await Category.findOne({ name });
			if (exists) {
				return res
					.status(400)
					.json({ message: "Category name already exists" });
			}

			category.name = name;
			category.slug = slugify(name, { lower: true });
		}

		if (icon) category.icon = icon;

		if (req.file) {
			if (category.image?.public_id) {
				await cloudinary.uploader.destroy(category.image.public_id);
			}

			category.image = {
				url: req.file.path,
				public_id: req.file.filename,
			};
		}

		await category.save();

		return res.status(200).json({ category });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   TOGGLE CATEGORY ACTIVE / INACTIVE
--------------------------------------------------- */
export const toggleCategoryStatus = async (req, res) => {
	try {
		const { categoryId } = req.body;

		if (!categoryId) {
			return res.status(400).json({ message: "Category ID required" });
		}

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		category.isActive = !category.isActive;
		await category.save();

		return res.status(200).json({
			message: `Category ${category.isActive ? "activated" : "deactivated"}`,
			category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

/* -------------------------------------------------
   DELETE CATEGORY
--------------------------------------------------- */
export const deleteCategory = async (req, res) => {
	try {
		const { categoryId } = req.body;

		if (!categoryId) {
			return res.status(400).json({ message: "Category ID required" });
		}

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		if (category.image?.public_id) {
			await cloudinary.uploader.destroy(category.image.public_id);
		}

		await category.deleteOne();

		return res.status(200).json({
			message: "Category deleted successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};
