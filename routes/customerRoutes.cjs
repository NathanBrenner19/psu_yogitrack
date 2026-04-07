const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController.cjs");

// GET one customer
router.get("/getCustomer", customerController.getCustomer);

// ADD customer
router.post("/add", customerController.add);

// GET all customer IDs
router.get("/getCustomerIds", customerController.getCustomerIds);

// DELETE customer
router.delete("/deleteCustomer", customerController.deleteCustomer);

// CHECK duplicate name
router.get("/checkCustomerName", customerController.checkCustomerName);

module.exports = router;
