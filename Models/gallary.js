const mongoose = require("mongoose");

const gallarySchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallary", gallarySchema);
