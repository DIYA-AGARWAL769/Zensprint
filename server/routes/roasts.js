import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all roasts
router.get("/", async (req, res) => {
  const userId = req.user.userId;
  try {
    const roasts = await db.getRoasts(userId);
    res.json(roasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new custom roast
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const { text, category, severity } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Roast text is required" });
  }
  
  const activeCategory = category || "Custom";
  const activeSeverity = severity || "Spicy";

  try {
    const newRoast = await db.addRoast(userId, text.trim(), activeCategory, activeSeverity);
    res.status(201).json(newRoast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update a custom roast
router.put("/:id", async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { text, category, severity } = req.body;

  const updates = {};
  if (text !== undefined) updates.text = text.trim();
  if (category !== undefined) updates.category = category;
  if (severity !== undefined) updates.severity = severity;

  try {
    const updated = await db.updateRoast(userId, id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Roast not found or unauthorized to update" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a custom roast
router.delete("/:id", async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  try {
    const deleted = await db.deleteRoast(userId, id);
    res.json({ success: true, message: "Roast deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST reset roasts back to defaults
router.post("/reset", async (req, res) => {
  const userId = req.user.userId;
  try {
    const defaults = await db.resetRoasts(userId);
    res.json({ success: true, data: defaults, message: "Roasts reset to default preset list." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
