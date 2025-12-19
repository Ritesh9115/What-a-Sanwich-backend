import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "Test-app",
		allowed_formats: ["jpg", "png", "jpeg", "webp"],
	},
});
export const upload = multer({ storage });
