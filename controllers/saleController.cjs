const Sale = require("../models/saleModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Package = require("../models/packageModel.cjs");

// Helper function to determine how many classes a package gives
function getClassesFromPackage(pkg) {
    const name = (pkg.packageName || "").toLowerCase();

    if (name.includes("single")) return 1;
    if (name.includes("4 class")) return 4;
    if (name.includes("10 class")) return 10;
    if (name.includes("unlimited")) return 9999;

    return 0;
}

// CREATE sale
exports.addSale = async (req, res) => {
    try {
        const {
            customerId,
            packageId,
            amountPaid,
            paymentMethod,
            validityStartDate,
            validityEndDate
        } = req.body || {};

        if (!customerId || !packageId || amountPaid === undefined || !validityStartDate || !validityEndDate) {
            return res.status(400).json({
                message: "Customer, package, amount paid, and validity dates are required"
            });
        }

        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const pkg = await Package.findOne({ packageId });
        if (!pkg) {
            return res.status(404).json({ message: "Package not found" });
        }

        if (Number(amountPaid) !== Number(pkg.price)) {
            return res.status(400).json({
                message: "Amount paid must match package price"
            });
        }

        const startDate = new Date(validityStartDate);
        const endDate = new Date(validityEndDate);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({
                message: "Invalid start or end date"
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }

        const classesAdded = getClassesFromPackage(pkg);

        if (classesAdded === 0) {
            return res.status(400).json({
                message: "Could not determine class amount from package"
            });
        }

        const count = await Sale.countDocuments();
        const saleId = "S" + String(count + 1).padStart(5, "0");

        const newSale = new Sale({
            saleId,
            customerId,
            packageId,
            packageName: pkg.packageName,
            
            amountPaid,
            paymentMethod,
            validityStartDate: startDate,
            validityEndDate: endDate,
            classesAdded
        });

        await newSale.save();

        customer.classBalance += classesAdded;
        await customer.save();

        res.status(201).json({
            message: "Sale recorded successfully",
            sale: newSale,
            updatedCustomerBalance: customer.classBalance
        });

    } catch (err) {
        console.error("ADD SALE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// READ all sales
exports.listSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ saleDateTime: -1 });
        res.json(sales);
    } catch (err) {
        console.error("LIST SALES ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// READ one sale
exports.getSaleById = async (req, res) => {
    try {
        const { saleId } = req.params;

        const sale = await Sale.findOne({ saleId });

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json(sale);
    } catch (err) {
        console.error("GET SALE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE sale
exports.deleteSaleById = async (req, res) => {
    try {
        const { saleId } = req.params;

        const sale = await Sale.findOne({ saleId });
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        const customer = await Customer.findOne({ customerId: sale.customerId });
        if (customer) {
            customer.classBalance -= sale.classesAdded;
            if (customer.classBalance < 0) {
                customer.classBalance = 0;
            }
            await customer.save();
        }

        await Sale.findOneAndDelete({ saleId });

        res.json({ message: "Sale deleted successfully" });
    } catch (err) {
        console.error("DELETE SALE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};