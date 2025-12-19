import { Table } from "../models/Table.js";

const addTable = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const count = await Table.countDocuments();

	const table = new Table({
		tableNumber: count + 1,
	});

	await table.save();

	res.json({ message: "Table added", table });
};

const removeTable = async (req, res) => {
	const { tableNumber } = req.body;

	if (!tableNumber) {
		return res.status(400).json({ message: "Table number required" });
	}

	if (req.user.role !== "admin") {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const table = await Table.findOne({ tableNumber });

	if (!table) {
		return res.status(404).json({ message: "Table not found" });
	}

	if (table.currentOrder) {
		return res.status(400).json({
			message: "Cannot delete a table with an active order",
		});
	}

	await Table.deleteOne({ tableNumber });

	// Re-arrange numbers
	const tables = await Table.find().sort({ tableNumber: 1 });

	let num = 1;
	for (let t of tables) {
		t.tableNumber = num++;
		await t.save();
	}

	res.json({
		message: "Table removed & numbers re-arranged",
	});
};

const disableTable = async (req, res) => {
	const { tableNumber } = req.body;

	if (!tableNumber) {
		return res.status(400).json({ message: "Table number required" });
	}

	if (req.user.role !== "admin") {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const table = await Table.findOne({ tableNumber });

	if (!table) {
		return res.status(404).json({ message: "Table not found" });
	}

	table.isDisabled = true;
	await table.save();

	res.json({ message: "Table disabled", table });
};

const enableTable = async (req, res) => {
	const { tableNumber } = req.body;

	if (!tableNumber) {
		return res.status(400).json({ message: "Table number required" });
	}

	if (req.user.role !== "admin") {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const table = await Table.findOne({ tableNumber });

	if (!table) {
		return res.status(404).json({ message: "Table not found" });
	}

	table.isDisabled = false;
	await table.save();

	res.json({ message: "Table enabled", table });
};

const listTables = async (req, res) => {
	const tables = await Table.find().sort({ tableNumber: 1 });
	res.json({ tables });
};
const fetchOneTable = async (req, res) => {
	const { tableNumber } = req.body;
	const tables = await Table.findOne({ tableNumber });
	res.json({ tables });
};

export {
	addTable,
	removeTable,
	listTables,
	enableTable,
	disableTable,
	fetchOneTable,
};
