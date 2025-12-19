import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";

/* ---------------- ADD PROFILE ---------------- */
const addProfilePic = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Unauthorized" });
		}

		if (!req.file?.path) {
			return res.status(400).json({ message: "Image required" });
		}

		const profile = new Profile({
			name: req.body.name || "Avatar",
			pictureUrl: req.file.path,
			isActive: true,
		});

		await profile.save();

		res.status(201).json({ message: "Avatar added", profile });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

/* ---------------- ENABLE / DISABLE ---------------- */
const toggleProfileStatus = async (req, res) => {
	try {
		const { profileId } = req.body;

		const profile = await Profile.findById(profileId);
		if (!profile) {
			return res.status(404).json({ message: "Profile not found" });
		}

		profile.isActive = !profile.isActive;
		await profile.save();

		res.status(200).json({ message: "Status updated", profile });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

/* ---------------- DELETE PROFILE ---------------- */
const deleteProfile = async (req, res) => {
	try {
		const { profileId } = req.body;

		const profile = await Profile.findById(profileId);
		if (!profile) {
			return res.status(404).json({ message: "Profile not found" });
		}

		// optional safety: unset users using this avatar
		await User.updateMany(
			{ profilePic: profileId },
			{ $unset: { profilePic: "" } }
		);

		await profile.deleteOne();

		res.status(200).json({ message: "Avatar deleted" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "Server error" });
	}
};

/* ---------------- LIST ALL (ADMIN) ---------------- */
const listAllProfiles = async (req, res) => {
	const profiles = await Profile.find().sort({ createdAt: -1 });
	res.json({ profiles });
};

/* ---------------- LIST ACTIVE (USER) ---------------- */
const listActiveProfiles = async (req, res) => {
	const profiles = await Profile.find({ isActive: true });
	res.json({ profiles });
};

/* ---------------- SET USER PROFILE ---------------- */
const setProfilePic = async (req, res) => {
	const { profileId } = req.body;

	const profile = await Profile.findOne({
		_id: profileId,
		isActive: true,
	});

	if (!profile) {
		return res.status(404).json({ message: "Profile not available" });
	}

	const user = await User.findById(req.user.id);
	user.profilePic = profileId;
	await user.save();

	res.json({ message: "Profile updated", profile });
};

export {
	addProfilePic,
	toggleProfileStatus,
	deleteProfile,
	listAllProfiles,
	listActiveProfiles,
	setProfilePic,
};
