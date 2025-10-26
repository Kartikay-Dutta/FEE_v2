import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log('Signup attempt:', { name, email }); // Log signup attempt

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const user = await User.create({ name, email, password_hash: password });
    console.log('User created:', { id: user.id, email: user.email }); // Log success

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (e) {
    console.error('Signup error:', e); // Log the actual error
    res.status(500).json({ error: "Signup failed: " + e.message });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
