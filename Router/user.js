const express = require("express");
const router = express.Router();
const UserController = require("../Controller/user");
const Authentication = require("../Authentication/auth");
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/send-otp", UserController.sendOTP);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/reset-password", UserController.resetPassword);

router.put(
  "/update-student/:id",
  Authentication.adminStaffAuth,
  UserController.updateStudentById
);

router.get(
  "/getStudentByRollNo/:roll",
  Authentication.adminStaffAuth,
  UserController.getStudentByRollNo,
);
router.post(
  "/registerStudentByStaff",
  Authentication.adminStaffAuth,
  UserController.registerStudentByStaff,
);
router.post(
  "/addstaff",
  Authentication.adminStaffAuth,
  UserController.addStaffByAdmin,
);
router.get("/getAllStaff", UserController.getAllStaff);
router.put(
  "/updatestaff/:id",
  Authentication.adminStaffAuth,
  UserController.updateStaffById,
);
router.delete(
  "/delete-staff/:id",
  Authentication.adminStaffAuth,
  UserController.deleteStaff,
);
router.post("/logout", Authentication.studentAuth, UserController.logout);
module.exports = router;
