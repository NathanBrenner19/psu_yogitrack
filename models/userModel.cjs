const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true },

    firstName: String,
    lastName: String,

    username: { type: String, unique: true },
    email: { type: String, unique: true },

    password: String, // hashed

    role: {
        type: String,
        enum: ["admin", "manager", "instructor"],
        default: "manager"
    },

    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("User", userSchema);