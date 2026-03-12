const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

router.get("/getGeneralPackages", packageController.getGeneralPackages);
router.get("/getSpecialPackages", packageController.getSpecialPackages);

module.exports = router;