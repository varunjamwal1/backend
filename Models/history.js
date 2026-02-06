const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  roll: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fines: [
    {
      fineId: { type: mongoose.Schema.Types.ObjectId, ref: "Fine", required: true },
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
      paidAt: { type: Date, default: null }
    }
  ],
  totalFine: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);
