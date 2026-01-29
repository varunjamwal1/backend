const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // assuming your user model is "User"
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fine", FineSchema);
