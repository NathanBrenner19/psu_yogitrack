const Customer = require("../models/customerModel.cjs");

exports.search = async (req, res) => {
  try {
    const searchString = req.query.firstname;
    const customer = await Customer.find({
      firstname: { $regex: searchString, $options: "i" },
    });

    if (!customer || customer.length === 0) {
      return res.status(404).json({ message: "No customer found" });
    } else {
      res.json(customer[0]);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Find the customer selected in the dropdown
exports.getCustomer = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const customerDetail = await Customer.findOne({ customerId: customerId });

    res.json(customerDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      customerId,
      firstname,
      lastname,
      email,
      phone,
      address,
      preferredContact,
      classBalance
    } = req.body;

    // Basic validation
    if (!firstname || !lastname || !email || !phone || !address || !preferredContact) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new customer document
    const newCustomer = new Customer({
      customerId,
      firstname,
      lastname,
      address,
      phone,
      email,
      preferredContact,
      classBalance: classBalance ?? 0
    });

    // Save to database
    await newCustomer.save();
    res.status(201).json({
      message: "Customer added successfully",
      customer: newCustomer
    });
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).json({
      message: "Failed to add customer",
      error: err.message
    });
  }
};

// Populate the customerId dropdown
exports.getCustomerIds = async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      { customerId: 1, firstname: 1, lastname: 1, _id: 0 }
    ).sort();

    res.json(customers);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getNextId = async (req, res) => {
  try {
    const lastCustomer = await Customer.find({})
      .sort({ customerId: -1 })
      .limit(1);

    let maxNumber = 1;

    if (lastCustomer.length > 0) {
      const lastId = lastCustomer[0].customerId;
      const match = lastId.match(/\d+$/);

      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }

    const nextId = `C${maxNumber}`;
    res.json({ nextId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.query;
    const result = await Customer.findOneAndDelete({ customerId });

    if (!result) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted", customerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check if a customer with the same first and last name already exists
exports.checkCustomerName = async (req, res) => {
  try {
    const { firstname, lastname } = req.query;

    const existingCustomer = await Customer.findOne({
      firstname: { $regex: new RegExp(`^${firstname}$`, "i") },
      lastname: { $regex: new RegExp(`^${lastname}$`, "i") }
    });

    res.json({ exists: !!existingCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
