const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    saleId: {
        type: String,
        unique: true
    },
    customerId: {
        type: String,
        required: true
    },
    packageId: {
        type: String,
        required: true
    },
    packageName: {
        type: String,
        required: true
    },
    
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "zelle", "other"],
        default: "cash"
    },
    saleDateTime: {
        type: Date,
        default: Date.now
    },
    validityStartDate: {
        type: Date,
        required: true
    },
    validityEndDate: {
        type: Date,
        required: true
    },
    classesAdded: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Sale", saleSchema);