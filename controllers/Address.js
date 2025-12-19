import httpStatus from "http-status";
import { Address } from "../models/Address.js";
import { User } from "../models/User.js";

const addAddress = async (req, res) => {
	try {
		const {
			addressType,
			isDefault,
			fullName,
			phone,
			pincode,
			landmark,
			city,
			country,
			state,
			address,
		} = req.body;

		if (!country || !city || !state || !address || !phone) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Please enter Required fileds" });
		}
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "User not found" });
		}
		const prevAddress = await Address.find({ user: userId });

		let finalDefault = isDefault;
		if (prevAddress.length === 0) {
			finalDefault = true;
		}

		if (finalDefault === true) {
			await Address.updateMany(
				{ user: userId },
				{ $set: { isDefault: false } }
			);
		}

		if (!["home", "work", "other"].includes(addressType)) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "wrong addressType" });
		}

		const newAddress = new Address({
			user: userId,
			addressType,
			isDefault: finalDefault,
			fullName,
			phone,
			pincode,
			landmark,
			city,
			country,
			state,
			address,
		});
		await newAddress.save();
		user.address.push(newAddress._id);
		await user.save();

		return res
			.status(httpStatus.OK)
			.json({ message: "Address Added successfully", address: newAddress });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const removeAddress = async (req, res) => {
	try {
		const { addressID } = req.body;
		if (!addressID)
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Missing Required filed" });

		const userId = req.user._id;
		const user = await User.findById(userId);

		if (!user) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "User Not Found" });
		}

		const checkAddress = user.address.includes(addressID);
		if (!checkAddress) {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Wrong Address" });
		}
		const address = await Address.findById(addressID);
		if (!address) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "Address Not Found" });
		}
		const wasDefault = address.isDefault;

		const deletedAddress = await Address.findByIdAndDelete(addressID);
		await User.findByIdAndUpdate(userId, { $pull: { address: addressID } });

		if (!deletedAddress) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "Address Not Found" });
		}
		if (wasDefault) {
			const remaining = await Address.find({ user: userId }).sort({
				createdAt: 1,
			});

			if (remaining.length > 0) {
				remaining[0].isDefault = true;
				await remaining[0].save();
			}
		}

		return res
			.status(httpStatus.OK)
			.json({ message: "Address deleted successfully" });
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const updateAddress = async (req, res) => {
	try {
		const {
			addressID,
			addressType,
			isDefault,
			fullName,
			phone,
			pincode,
			landmark,
			city,
			country,
			state,
			address: textAddress,
		} = req.body;

		if (!addressID) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Address ID is required" });
		}

		if (!country || !city || !state || !textAddress || !phone) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ message: "Please enter required fields" });
		}

		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "User not found" });
		}

		const prevaddress = await Address.findById(addressID);
		if (!prevaddress) {
			return res
				.status(httpStatus.NOT_FOUND)
				.json({ message: "Address not found" });
		}

		// Ownership check
		if (prevaddress.user.toString() !== userId.toString()) {
			return res
				.status(httpStatus.UNAUTHORIZED)
				.json({ message: "Not authorized" });
		}

		// If new default → remove old default
		if (isDefault === true) {
			await Address.updateMany(
				{ user: userId },
				{ $set: { isDefault: false } }
			);
		}

		// Update fields with fallback to existing values
		prevaddress.addressType = addressType ?? prevaddress.addressType;
		prevaddress.isDefault = isDefault ?? prevaddress.isDefault;
		prevaddress.fullName = fullName ?? prevaddress.fullName;
		prevaddress.phone = phone ?? prevaddress.phone;
		prevaddress.pincode = pincode ?? prevaddress.pincode;
		prevaddress.landmark = landmark ?? prevaddress.landmark;
		prevaddress.city = city ?? prevaddress.city;
		prevaddress.country = country ?? prevaddress.country;
		prevaddress.state = state ?? prevaddress.state;
		prevaddress.address = textAddress ?? prevaddress.address;

		await prevaddress.save();

		return res.status(200).json({
			message: "Address updated successfully",
			address: prevaddress,
		});
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

const listAllAddress = async (req, res) => {
	try {
		const userId = req.user._id;
		const addresses = await Address.find({ user: userId });

		return res.status(200).json({
			message: "Addresses fetched successfully",
			addresses,
		});
	} catch (error) {
		console.log(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ message: "Server Error" });
	}
};

export { addAddress, removeAddress, updateAddress, listAllAddress };
