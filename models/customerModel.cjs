const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const customerModel = new mongoose.Schema({
    customerId: String,            // e.g., C00123
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    address: String,
    preferredContact: String,      // "phone" or "email"
    classBalance: {
        type: Number,
        default: 0                // starts at 0 (from your use case)
    }
}, { collection: "customer" });

module.exports = mongoose.model("customer", customerModel);
