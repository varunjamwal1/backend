const express = require("express");
const router = express.Router();
const historyController = require("../Controller/history");
const Authentication = require("../Authentication/auth");

router.post("/add", Authentication.adminStaffAuth, historyController.addHistory);
router.get("/getAll", Authentication.adminStaffAuth, historyController.getAllHistory);
router.get("/get", Authentication.studentAuth, historyController.getUserHistory);
router.patch("/updateFineStatus", Authentication.adminStaffAuth, historyController.updateFineStatus);

module.exports = router;
