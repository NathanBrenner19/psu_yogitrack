const User = require("../models/userModel.cjs");
const bcrypt = require("bcrypt");

// LOGIN
exports.login = async (req, res) => {
    try {

        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
                receivedBody: req.body || null
            });
        }

        const user = await User.findOne({ username, isActive: true });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        res.json({
            message: "Login successful",
            user: {
                userId: user.userId,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// REGISTER (ADMIN ONLY)
exports.register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            role
        } = req.body || {};

        const existing = await User.findOne({ username });

        if (existing) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const count = await User.countDocuments();
        const userId = "U" + String(count + 1).padStart(5, "0");

        const newUser = new User({
            userId,
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.json({ message: "User created successfully", userId });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};