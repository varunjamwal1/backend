const gallaryModel = require("../Models/gallary");

exports.addPhoto = async (req, res) => {
  try {
    const { link } = req.body;

    // Validate required field
    if (!link) {
      return res.status(400).json({ error: "Photo link is required" });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized. Login required." });
    }

    // Create new photo entry
    const image = new gallaryModel({
      link,
      addedBy: req.user.id
    });

    await image.save();

    return res.status(201).json({
      message: "Photo added successfully",
      photo: image
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};

exports.getAllPhotos = async (req, res) => {
  try {
    const images = await gallaryModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Photos retrieved successfully",
      images
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await gallaryModel.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({ error: "Photo not found" });
    }

    return res.status(200).json({
      message: "Photo deleted successfully",
      image
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server Error",
      issue: error.message
    });
  }
};
