const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const packageModel = new mongoose.Schema({
    packageId: String,
    packageName: String,
    description: String,
    price: mongoose.Schema.Types.Int32
}, {collection:"package"});

module.exports = mongoose.model("Package", packageModel)