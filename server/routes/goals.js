import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all goals (optional date filter)
router.get("/", async (req, res) => {
  const userId = req.user.userId;
  const { date } = req.query; // YYYY-MM-DD

  try {
    const goals = await db.getGoals(userId, date);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET past incomplete goals
router.get("/incomplete-past", async (req, res) => {
  const userId = req.user.userId;
  const { today } = req.query; // YYYY-MM-DD

  if (!today) {
    return res.status(400).json({ error: "today date parameter is required (YYYY-MM-DD)" });
  }

  try {
    const goals = await db.getPastIncompleteGoals(userId, today);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST rollover past incomplete goals
router.post("/rollover", async (req, res) => {
  const userId = req.user.userId;
  const { goalIds, todayDate } = req.body;

  if (!goalIds || !Array.isArray(goalIds) || !todayDate) {
    return res.status(400).json({ error: "goalIds array and todayDate string are required" });
  }

  try {
    await db.rolloverGoals(userId, goalIds, todayDate);
    res.json({ success: true, message: "Goals rolled over successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new goal
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const { title, date, duration } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Goal title is required" });
  }

  const activeDate = date || new Date().toISOString().split("T")[0];
  const activeDuration = Number(duration) || 25;

  try {
    const newGoal = await db.addGoal(userId, title.trim(), false, activeDate, activeDuration);
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update a goal
router.put("/:id", async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, completed, date, duration } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (completed !== undefined) updates.completed = completed;
  if (date !== undefined) updates.date = date;
  if (duration !== undefined) updates.duration = Number(duration) || 25;

  try {
    // Fetch goals to find current completion state of the goal
    const goals = await db.getGoals(userId);
    const existingGoal = goals.find(g => g._id.toString() === id.toString());
    
    if (!existingGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Award rewards when goal completion state changes
    if (completed !== undefined && completed !== existingGoal.completed) {
      const settings = await db.getSettings(userId);
      let coinDiff = 0;
      let xpDiff = 0;

      if (existingGoal.isShameChore) {
        // Award +1 ZenCoin & +1 XP discipline reward when Shame Chore is completed!
        coinDiff = completed ? 1 : -1;
        xpDiff = completed ? 1 : -1;
      } else {
        // Regular sprint goal completion (+10 ZenCoins, +50 XP)
        coinDiff = completed ? 10 : -10;
        xpDiff = completed ? 50 : -50;
      }
      
      const newCoins = Math.max(0, (settings.zenCoins || 0) + coinDiff);
      const newXP = Math.max(0, (settings.zenXP || 0) + xpDiff);
      
      await db.updateSettings(userId, { zenCoins: newCoins, zenXP: newXP });
    }

    const updated = await db.updateGoal(userId, id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a goal
router.delete("/:id", async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  try {
    await db.deleteGoal(userId, id);
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
