const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.cjs");
const requireAdmin = require("../middleware/adminMiddleware.cjs");

router.get("/list", requireAdmin, userController.listUsers);
router.get("/:userId", requireAdmin, userController.getUserById);
router.put("/:userId", requireAdmin, userController.updateUserById);
router.delete("/:userId", requireAdmin, userController.deleteUserById);
router.put("/userID", requireAdmin, userController.updateUserById);

module.exports = router;