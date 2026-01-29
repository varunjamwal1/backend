const NoticeModel = require("../Models/notification");

exports.addN = async (req, res) => {
  try {
    const { title } = req.body;

    // Validate input
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    // Ensure logged-in user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized. Please login." });
    }

    // Create notice
    const notification = new NoticeModel({
      title,
      addedBy: req.user.id
    });

    await notification.save();

    return res.status(201).json({
      message: "Notice added successfully",
      notice: notification
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.getAllN = async (req, res) => {
  try {
    const notices = await NoticeModel
      .find()
     // .populate("addedBy", "name email") // optional: remove if not needed
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notices retrieved successfully",
      notices
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.deleteN = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotice = await NoticeModel.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    return res.status(200).json({ message: "Notice deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};
