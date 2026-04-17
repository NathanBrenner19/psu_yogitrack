const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const checkInModel = new mongoose.Schema({
    checkinId: mongoose.Schema.Types.Int32,
    customerId: String,
    classId: String,
    datetime: String
}, {collection: "attendance"});


module.exports = mongoose.model("CheckIn", checkInModel);