const express = require("express");
const router = express.Router();
const gallaryController = require("../Controller/gallary");
const Authentication = require('../Authentication/auth')

router.post("/addPhoto", Authentication.adminStaffAuth, gallaryController.addPhoto);
router.get("/getAllPhotos", gallaryController.getAllPhotos);
router.delete("/deletePhoto/:id", Authentication.adminStaffAuth, gallaryController.deletePhoto);
module.exports = router;