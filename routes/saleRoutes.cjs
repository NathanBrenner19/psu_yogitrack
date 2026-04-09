const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController.cjs");

router.post("/add", saleController.addSale);
router.get("/list", saleController.listSales);
router.get("/:saleId", saleController.getSaleById);
router.delete("/:saleId", saleController.deleteSaleById);

module.exports = router;