const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.cjs");
const requireAdmin = require("../middleware/adminMiddleware.cjs");

router.post("/login", authController.login);
router.post("/register", requireAdmin, authController.register);

module.exports = router;