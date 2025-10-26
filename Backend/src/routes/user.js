import express from "express";
import jwt from "jsonwebtoken";
import sequelize from "../models/index.js";

const router = express.Router();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

export default router;
