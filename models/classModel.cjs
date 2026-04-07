const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const classDayTimeModel = new mongoose.Schema({
    day: String,
    time: String,
    duration: mongoose.Schema.Types.Int32
});

const classModel = new mongoose.Schema({
    classId: String,
    className: String,
    instructorId: String,
    classType: String,
    description: String,
    daytime: [classDayTimeModel]
}, {collection: "class"});

module.exports = mongoose.model("Class", classModel);
