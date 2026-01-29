const UserModal = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cookieOption = {
  httpOnly: true,
  secure: false,
  sameSite: 'Lax'
};

// ================= MAIL TRANSPORTER ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ================= REGISTER ==========================
exports.register = async (req, res) => {
  try {
    const { name, roll, email, password, mobile, fatherName, class: studentClass } = req.body;

    if (!name || !roll || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const isExist = await UserModal.findOne({ $or: [{ email }, { roll }] });
    if (isExist) {
      return res.status(400).json({ error: "Email / roll already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModal({
      name,
      roll,
      email,
      password: hashedPassword,
     
   
   
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      success: true
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};

// ================= LOGIN ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await UserModal.findOne({ email });

    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, "Its_My_Securet_key", { expiresIn: "7d" });

    res.cookie("token", token, cookieOption);

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};

// ================= SEND OTP =========================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModal.findOne({ email });

    if (!user)
      return res.status(400).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

 await transporter.sendMail({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: "Password Reset OTP | Dronacharya PG College Fine Management ",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; background: #f7f9fc; border-radius: 10px; border: 1px solid #ddd;">
      
      <h2 style="text-align: center; color: #2a4d9b;">Dronacharya PG College</h2>

      <p style="font-size: 15px; color: #333;">
        Hello <strong>${email}</strong>,
      </p>

      <p style="font-size: 15px; color: #333;">
        You requested to reset your password. Please use the OTP below to complete your verification.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <div style="
          display: inline-block;
          font-size: 32px;
          letter-spacing: 6px;
          color: #ffffff;
          background: #2a4d9b;
          padding: 15px 25px;
          border-radius: 8px;
          font-weight: bold;
        ">
          ${otp}
        </div>
      </div>

      <p style="font-size: 14px; color: #555;">
        This OTP is valid for <strong>1 hour</strong>.  
        If you did not request this, please ignore this email.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

      <p style="font-size: 13px; text-align: center; color: #777;">
        © ${new Date().getFullYear()} Dronacharya PG College  
        <br />
        This is an automated message. Please do not reply.
      </p>
    </div>
  `,
});


    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    res.status(500).json({ error: "Email error", issue: err.message });
  }
};

// ================= VERIFY OTP ========================
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const user = await UserModal.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    res.status(200).json({ message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};

// ================= RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await UserModal.findOne({ email });

    if (!user)
      return res.status(400).json({ error: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};

// ================= UPDATE STUDENT ======================
// ================= UPDATE STUDENT ======================
exports.updateStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Update student with validation
    const updatedStudent = await UserModal.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // return updated doc & validate schema
    );

    if (!updatedStudent)
      return res.status(404).json({ error: "Student not found" });

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};


exports.getStudentByRollNo = async (req, res) => {
  try {
    const { roll } = req.params;

    // Fix typo: "conat" → "const"
    const student = await UserModal.findOne({ roll });

    if (student) {
      return res.status(200).json({
        message: 'Student fetched successfully',
        student
      });
    }

    return res.status(404).json({ error: 'No such student found' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error", issue: err.message });
  }
};
// ================= REGISTER STUDENT BY STAFF =================

exports.registerStudentByStaff = async (req, res) => {
  try {
    const { name, roll, email, mobile, fatherName, class: studentClass } = req.body;

    if (!name || !roll || !email || !mobile || !fatherName || !studentClass) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🔍 CHECK DUPLICATES FIRST
    const existingStudent = await UserModal.findOne({
      $or: [{ email }, { roll }]
    });

    if (existingStudent) {
      return res.status(400).json({
        error:
          existingStudent.email === email
            ? "Student with this email already exists"
            : "Student with this roll number already exists"
      });
    }

    // 🔐 Generate 6-digit password
    const buffer = crypto.randomBytes(4);
    const plainPassword = ((buffer.readUInt32BE(0) % 900000) + 100000).toString();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 💾 Save student
    const student = await UserModal.create({
      name,
      roll,
      email,
      mobile,
      fatherName,
      class: studentClass,
      password: hashedPassword,
      role: "student",
      createdBy: req.user._id
    });

    // 📧 Send email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Student Portal Credentials",
      text: `
Hello ${name},

Your student account has been created.

Email: ${email}
Password: ${plainPassword}

Please login and change your password.

Regards,
College Management
      `
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        _id: student._id,
        name: student.name,
        roll: student.roll,
        email: student.email
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    // 🧠 Mongo duplicate fallback (safety net)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`
      });
    }

    return res.status(500).json({
      error: "Server error",
      issue: err.message
    });
  }
};

// ================= ADD STAFF BY ADMIN =========================
exports.addStaffByAdmin = async (req, res) => {
  try {
    const { name, email, designation, mobileNo } = req.body;

    // Validate input
    if (!name || !email || !designation || !mobileNo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if staff already exists
    const searchStaff = await UserModal.findOne({ email });
    if (searchStaff) {
      return res.status(400).json({ error: "Staff with this email already exists" });
    }

    // Default password
    const defaultPassword = "Staff@1234";
    const hashedPass = await bcrypt.hash(defaultPassword, 10);

    // Generate unique staff roll number
    const staffRoll = "STAFF-" + Math.floor(1000 + Math.random() * 9000);

    // Create staff user
    const user = new UserModal({
      name,
      email,
      designation,
      mobile: mobileNo,  // your schema uses 'mobile'
      password: hashedPass,
      role: "staff",
      roll: staffRoll          // <-- FIXED (required field)
    });

    await user.save();

    // Email Template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to the Team!</h2>
        <p>Dear <strong>${name}</strong>,</p>

        <p>You have been added as <strong>${designation}</strong> in our system.</p>

        <p>Your login credentials are:</p>

        <div style="margin: 20px 0; padding: 15px; background:#f5f5f5; border-radius:10px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${defaultPassword}</p>
          <p><strong>Staff ID:</strong> ${staffRoll}</p>
        </div>

        <p>We strongly recommend changing your password after your first login for security reasons.</p>

        <br/>
        <p>Best regards,<br/><strong>Admin Team</strong></p>
      </div>
    `;

    // Send Email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Your Staff Account Login Details",
      html: htmlTemplate,
    });

    res.status(200).json({ message: "Staff added successfully & email sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server error",
      issue: err.message
    });
  }
};


// ================= GET ALL STAFF =========================
exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await UserModal.find({ role: "staff" })
  
    return res.status(200).json({ staffList });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
      issue: err.message
    });
  }
};

exports.updateStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, mobile } = req.body;

    // Find staff by ID
    const staff = await UserModal.findById(id);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Update only provided fields
    if (name) staff.name = name;
    if (designation) staff.designation = designation;
    if (mobile) staff.mobile = mobile;

    await staff.save();

    return res.status(200).json({
      message: "Staff updated successfully",
      staff
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
      issue: err.message
    });
  }
};

// ================= DELETE STAFF =========================
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStaff = await UserModal.findByIdAndDelete(id);

    // If no staff found
    if (!deletedStaff) {
      return res.status(404).json({ error: "No such staff found" });
    }

    return res.status(200).json({
      message: "Staff deleted successfully",
      deletedStaff
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
      issue: err.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,      // use only if HTTPS
      sameSite: "none",
      path: "/"
    });

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Logout error",
      issue: err.message
    });
  }
};
