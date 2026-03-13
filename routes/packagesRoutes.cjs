const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

router.get("/getGeneralPackages", packageController.getGeneralPackages);
router.get("/getSpecialPackages", packageController.getSpecialPackages);
router.post("/createPackage", packageController.createPackage);
router.get("/getPackageIds", packageController.getPackagesId);
router.delete("/deletePackage", packageController.deletePackage);

module.exports = router;