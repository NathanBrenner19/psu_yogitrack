const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

router.get("/getPackage", packageController.getPackage);
router.post("/add", packageController.add);
router.get("/getGeneralPackages", packageController.getGeneralPackages);
router.get("/getSpecialPackages", packageController.getSpecialPackages);
router.post("/createPackage", packageController.createPackage);
router.get("/getPackageIds", packageController.getPackageIds);
router.delete("/deletePackage", packageController.deletePackage);

module.exports = router;