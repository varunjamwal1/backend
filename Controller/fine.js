const FineModel = require("../Models/fine");
const { create } = require("../Models/user");

exports.addFine = async (req, res) => {
  try {
    const { name, amount } = req.body;

    // Validate input
    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }

    // Ensure amount is a valid number
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Ensure req.user exists (meaning user is logged in)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized. Login required." });
    }

    // Create fine entry
    const newFine = new FineModel({
      name,
      amount,
      addedBy: req.user.id
    });

    await newFine.save();

    return res.status(201).json({
      message: "Fine added successfully",
      fine: newFine
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};
exports.getFines = async (req, res) => {
  try {
    const fines = await FineModel
      .find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Fines retrieved successfully",
      fines
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.updateFineById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;

    // Validate fields
    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Update only allowed fields
    const updateData = {
      name,
      amount,
      updatedBy: req.user.id // Optional if you want to track updates
    };

    const fine = await FineModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    return res.status(200).json({
      message: "Fine updated successfully",
      fine
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.searchFines = async (req, res) => {
  try {
    const { name } = req.query;

    const fines = await FineModel.find({
      name: { $regex: name, $options: "i" }
    }).populate("addedBy", "name");

    return res.status(200).json({
      message: "Fines searched successfully",
      fines
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.deleteFineById = async (req, res) => {
  try {
    const { id } = req.params;

    const fine = await FineModel.findByIdAndDelete(id);

    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    return res.status(200).json({
      message: "Fine deleted successfully",
      fine
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};
