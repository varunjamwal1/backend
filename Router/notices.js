const express = require("express");
const router = express.Router();
const noticesController = require("../Controller/notices");
const Authentication = require('../Authentication/auth')
router.post("/add", Authentication.adminStaffAuth, noticesController.addN);
router.get("/getAll", noticesController.getAllN);
router.delete("/delete/:id", Authentication.adminStaffAuth, noticesController.deleteN);
module.exports = router;

