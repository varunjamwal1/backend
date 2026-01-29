const express = require("express");
const router = express.Router();
const FineController = require("../Controller/fine");
const Authentication = require('../Authentication/auth')

router.post("/addFine", Authentication.adminStaffAuth, FineController.addFine);
router.get("/getFines",  FineController.getFines);
router.get("/searchFinesByName", FineController.searchFines);
router.put("/updateFine/:id", Authentication.adminStaffAuth, FineController.updateFineById);
router.delete("/deleteFine/:id", Authentication.adminStaffAuth, FineController.deleteFineById);
module.exports = router;