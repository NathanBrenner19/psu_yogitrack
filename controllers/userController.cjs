const User = require("../models/userModel.cjs");
const bcrypt = require("bcrypt");

// GET all users
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true }, "-password").sort({ username: 1 });
        res.json(users);
    } catch (err) {
        console.error("LIST USERS ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// GET one user by userId
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId }, "-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("GET USER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// UPDATE user by userId
exports.updateUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            role,
            isActive
        } = req.body || {};

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if username is being changed to one that already exists
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: "Username already exists" });
            }
            user.username = username;
        }

        // Check if email is being changed to one that already exists
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }
            user.email = email;
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        // Only hash password if a new one was provided
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.json({
            message: "User updated successfully",
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error("UPDATE USER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE user by userId
exports.deleteUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const deletedUser = await User.findOneAndDelete({ userId });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("DELETE USER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};