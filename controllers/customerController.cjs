const Customer = require("../models/customerModel.cjs");

exports.search = async (req, res) => {
  try {
    const searchString = req.query.firstname;
    const customer = await Customer.find({
      firstName: { $regex: searchString, $options: "i" },
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
    try{
      const data = req.body;
      let customerId = data.customerId?.trim();

      if (customerId) {

        const existing = await Customer.findOne({ customerId });

        if (existing){

          existing.customerId = data.customerId;
          existing.firstName = data.firstName;
          existing.lastName = data.lastName;
          existing.address = data.address;
          existing.phone = data.phone;
          existing.email = data.email;
          existing.preferredContact = data.preferredContact;
          existing.classBalance = data.classBalance;
        }
        else {
          return res.status(404).json({ message: "Customer ID not found for update" });
        }

        await existing.save();
        
        return res.json({message: "Customer was updated", customerId});
        
      }

      const lastCustomer = await Customer.findOne().sort({ customerId: -1 });

      let newId = "Y001";

      if (lastCustomer && lastCustomer.customerId) {
        const lastNumber = parseInt(lastCustomer.customerId.substring(1), 10);
        newId = "Y" + (lastNumber + 1).toString().padStart(3, "0");
      }

      const newCustomer = new Customer({
        customerId: newId,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        preferredContact: data.preferredContact,
        classBalance: data.classBalance
      });

      await newCustomer.save();

      res.status(201).json({message: "Customer created", customerId: newId});
    }
    catch (err){
      console.log(err);
      res.status(500).json({message: "Server error"});
    }
};

// Populate the customerId dropdown
exports.getCustomerIds = async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      { customerId: 1, firstName: 1, lastName: 1, _id: 0 }
    ).sort();

    res.json(customers);
  } catch (e) {
    res.status(400).json({ error: e.message });
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
      firstName: { $regex: new RegExp(`^${firstname}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastname}$`, "i") }
    });

    res.json({ exists: !!existingCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
