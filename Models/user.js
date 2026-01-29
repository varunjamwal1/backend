const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    roll: {
      type: String,
       required: false,
      unique: true,
    },

    mobile: {
     type: String,
       default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

     fatherName: {
       type: String,
        default: "",
    trim: true,
     },

     class: {
      type: String,
       default: "",
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      default: "student", // student | teacher | admin
    },

     designation: {
      type: String,
      default: "",
     },

    resetPasswordToken: String, // token for password recovery
    resetPasswordExpire: Date,  // expire time for recovery
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
