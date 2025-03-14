const express = require("express");
const User = require("../models/userModel");
const userRoute = express.Router();
const jwt = require("jsonwebtoken");

// Generate Token Function
const generateToken = (id) => {
    return jwt.sign({ id }, "YATUHA@asaasasa", {
        expiresIn: "30d",
    });
};

// Register Route
userRoute.post("/register", async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const userExist = await User.findOne({ email });

        // Check if user already exists
        if (userExist) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        // Create a new user
        const user = await User.create({
            userName,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                userName: user.userName,
                email: user.email,
                token: generateToken(user._id), // Include token in response
            });
        } else {
            res.status(400).json({ message: "Invalid User Data" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login Route
userRoute.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = userRoute;
