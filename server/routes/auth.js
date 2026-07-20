import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "zensprint_super_secret_key_9988";

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;
  const targetEmail = (email || username || "").trim().toLowerCase();
  const rawPassword = (password || "").trim();
  
  if (!targetEmail || !rawPassword) {
    return res.status(400).json({ error: "Email address and password are required." });
  }

  // Email format validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(targetEmail)) {
    return res.status(400).json({ error: "Please provide a valid email address (e.g. user@example.com)." });
  }

  // Password length enforcement
  if (rawPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  try {
    const existing = await db.getUser(targetEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const uname = username?.trim() || targetEmail.split("@")[0];
    const user = await db.addUser(uname, hashedPassword, targetEmail, (firstName || "").trim(), (lastName || "").trim());

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  const targetIdentifier = (email || username || "").trim();

  if (!targetIdentifier || !password || !password.trim()) {
    return res.status(400).json({ error: "Email/Username and password are required." });
  }

  try {
    const user = await db.getUser(targetIdentifier);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials. Account not found." });
    }

    const match = await bcrypt.compare(password.trim(), user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials. Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Authentication Route
router.post("/google", async (req, res) => {
  const { googleToken, email, name } = req.body;
  const userEmail = (email || "google_user@zensprint.io").trim();
  const nameParts = (name || "Google User").split(" ");
  const firstName = nameParts[0] || "Google";
  const lastName = nameParts.slice(1).join(" ") || "User";

  try {
    let user = await db.getUser(userEmail);
    if (!user) {
      const randomPass = await bcrypt.hash("google_oauth_" + Date.now(), 10);
      const uname = userEmail.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
      user = await db.addUser(uname, randomPass, userEmail, firstName, lastName);
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve current user from session token
router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
