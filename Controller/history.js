const HistoryModel = require("../Models/history");
const FineModel = require("../Models/fine");
const nodemailer = require("nodemailer");

// =====================================
// EMAIL CONFIG
// =====================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// =====================================
// EMAIL HELPERS
// =====================================
const sendFineAddedEmail = async (student, history) => {
  if (!student?.email) return;

  const fineList = history.fines
    .map(f => `<li>${f.name} - ₹${f.amount} (${f.status})</li>`)
    .join("");

  const mailOptions = {
    from: `"Fine Management System" <${process.env.SENDER_EMAIL}>`,
    to: student.email,
    subject: "New Fine Added to Your Account",
    html: `
      <h2>Hello ${student.name},</h2>

      <p>The following fine(s) have been added to your account:</p>

      <ul>${fineList}</ul>

      <p><strong>Total Fine:</strong> ₹${history.totalFine}</p>

      <p>Please clear the dues at the earliest.</p>

      <br/>
      <p>Regards,<br/>
      College Administration</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendFineStatusUpdateEmail = async (student, fine) => {
  if (!student?.email) return;

  const mailOptions = {
    from: `"Fine Management System" <${process.env.SENDER_EMAIL}>`,
    to: student.email,
    subject: "Fine Status Updated",
    html: `
      <h2>Hello ${student.name},</h2>

      <p>Your fine status has been updated:</p>

      <table border="1" cellpadding="10" cellspacing="0">
        <tr>
          <th>Fine Name</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>${fine.name}</td>
          <td>₹${fine.amount}</td>
          <td>${fine.status.toUpperCase()}</td>
        </tr>
      </table>

      <br/>
      <p>Regards,<br/>
      College Administration</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// =====================================
// ADD HISTORY (ADD FINES TO STUDENT)
// =====================================
exports.addHistory = async (req, res) => {
  try {
    const { roll, student, fines } = req.body;

    if (!roll || !student || !Array.isArray(fines) || fines.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields"
      });
    }

    // Validate fineId
    for (let f of fines) {
      if (!f.fineId) {
        return res.status(400).json({
          success: false,
          msg: "fineId missing in fines array"
        });
      }
    }

    // Fetch fines from DB (security)
    const fineRecords = await FineModel.find({
      _id: { $in: fines.map(f => f.fineId) }
    });

    if (fineRecords.length !== fines.length) {
      return res.status(404).json({
        success: false,
        msg: "Some fines do not exist"
      });
    }

    const processedFines = fines.map(inputFine => {
      const dbFine = fineRecords.find(
        f => f._id.toString() === inputFine.fineId
      );

      return {
        fineId: dbFine._id,
        name: dbFine.name,
        amount: dbFine.amount,
        status: inputFine.status || "unpaid",
        paidAt: inputFine.status === "paid" ? new Date() : null
      };
    });

    const totalFine = processedFines.reduce(
      (sum, f) => sum + f.amount,
      0
    );

    const history = await HistoryModel.create({
      roll,
      student,
      fines: processedFines,
      totalFine,
      addedBy: req.user._id
    });

    await history.populate("student", "name email");

    // SEND EMAIL
    await sendFineAddedEmail(history.student, history);

    res.status(201).json({
      success: true,
      msg: "History added successfully",
      history
    });

  } catch (error) {
    console.error("ADD HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message
    });
  }
};

// =====================================
// GET ALL HISTORY (ADMIN / STAFF)
// =====================================
exports.getAllHistory = async (req, res) => {
  try {
    const history = await HistoryModel.find()
      .populate("student", "name roll")
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// =====================================
// GET STUDENT HISTORY
// =====================================
exports.getUserHistory = async (req, res) => {
  try {
    const { roll } = req.user;

    const history = await HistoryModel.find({ roll })
      .populate("student", "name roll class")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// =====================================
// UPDATE FINE STATUS + EMAIL
// =====================================
exports.updateFineStatus = async (req, res) => {
  try {
    const { historyId, fineId, status } = req.body;

    const history = await HistoryModel.findOneAndUpdate(
      { _id: historyId, "fines.fineId": fineId },
      {
        $set: {
          "fines.$.status": status,
          "fines.$.paidAt": status === "paid" ? new Date() : null
        }
      },
      { new: true }
    ).populate("student", "name email");

    if (!history) {
      return res.status(404).json({
        success: false,
        msg: "History or fine not found"
      });
    }

    const updatedFine = history.fines.find(
      f => f.fineId.toString() === fineId
    );

    // SEND EMAIL
    await sendFineStatusUpdateEmail(history.student, updatedFine);

    res.json({
      success: true,
      msg: "Fine status updated successfully",
      history
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
