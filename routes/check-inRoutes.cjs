const express  = require("express");
const router = express.Router();
const checkInController = require("../controllers/check-inController.cjs");

router.post("/add", checkInController.add);

module.exports = router;