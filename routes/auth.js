const verifyToken = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({ message: "User Registered Successfully 🔥" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================== LOGIN ==================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // User find karo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found ❌" });
        }

        // Password compare karo
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials ❌" });
        }

        const accessToken = jwt.sign(
   { userId: user._id, role: user.role },
   process.env.JWT_SECRET,
   { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
   { userId: user._id },
   process.env.REFRESH_SECRET,
   { expiresIn: "7d" }
);

res.json({
   message: "Login successful 🔥",
   accessToken,
   refreshToken
});

        res.json({
            message: "Login successful 🔥",
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= REFRESH TOKEN =================
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No Refresh Token ❌" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ message: "Invalid Refresh Token ❌" });
  }
});
// ================== DASHBOARD (PROTECTED) ==================
router.get("/dashboard", verifyToken, (req, res) => {
    res.json({
        message: "Welcome to Secure Dashboard 🔥",
        user: req.user
    });
});


module.exports = router;