import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET current settings
router.get("/", async (req, res) => {
  const userId = req.user.userId;
  try {
    const settings = await db.getSettings(userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT/POST update settings
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const { spiceLevel, categories, customRoastSound, customSuccessSound, customSupportiveSound, customAlarmSound } = req.body;
  const updates = {};
  
  if (spiceLevel !== undefined) {
    if (!["Mild", "Spicy", "Toxic"].includes(spiceLevel)) {
      return res.status(400).json({ error: "Invalid spiceLevel value" });
    }
    updates.spiceLevel = spiceLevel;
  }
  
  if (categories !== undefined) {
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array of strings" });
    }
    updates.categories = categories;
  }

  if (customRoastSound !== undefined) updates.customRoastSound = String(customRoastSound || "").trim();
  if (customSuccessSound !== undefined) updates.customSuccessSound = String(customSuccessSound || "").trim();
  if (customSupportiveSound !== undefined) updates.customSupportiveSound = String(customSupportiveSound || "").trim();
  if (customAlarmSound !== undefined) updates.customAlarmSound = String(customAlarmSound || "").trim();

  try {
    const updated = await db.updateSettings(userId, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST mark focus sprint complete
router.post("/sprint-complete", async (req, res) => {
  const userId = req.user.userId;
  const { goalId, duration } = req.body;
  const sprintDuration = Number(duration) || 25;

  try {
    const settings = await db.getSettings(userId);

    // Baseline Sprint Complete Rewards
    let coinsAwarded = 25;
    let xpAwarded = 150 + (sprintDuration * 2); // Bonus XP for longer sprints

    // If goal is specified, mark it complete and award a Combo Bonus (+10 coins, +50 XP)
    if (goalId) {
      await db.updateGoal(userId, goalId, { completed: true });
      coinsAwarded += 10;
      xpAwarded += 50;
    }

    // Calculate Streaks based on lastSprintDate
    const today = new Date().toISOString().split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split("T")[0];

    let currentStreak = settings.streak || 0;
    const lastSprintDate = settings.lastSprintDate || "";

    if (lastSprintDate === yesterday) {
      currentStreak += 1;
    } else if (lastSprintDate === today) {
      // Streak remains same since they completed another sprint today
    } else {
      currentStreak = 1; // Streak reset or starts fresh
    }

    const newCoins = (settings.zenCoins || 0) + coinsAwarded;
    const newXP = (settings.zenXP || 0) + xpAwarded;

    const updatedSettings = await db.updateSettings(userId, {
      zenCoins: newCoins,
      zenXP: newXP,
      streak: currentStreak,
      lastSprintDate: today
    });

    res.json({
      success: true,
      coinsAwarded,
      xpAwarded,
      streak: currentStreak,
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST purchase item in Shop
router.post("/shop/buy", async (req, res) => {
  const userId = req.user.userId;
  const { itemType, itemId } = req.body;

  try {
    const settings = await db.getSettings(userId);
    const updates = {};

    if (itemType === "shield") {
      const cost = 50;
      if ((settings.zenCoins || 0) < cost) {
        return res.status(400).json({ error: "Insufficient ZenCoins! Shields cost 50 ZenCoins." });
      }
      updates.zenCoins = settings.zenCoins - cost;
      updates.shields = (settings.shields || 0) + 1;

    } else if (itemType === "theme") {
      const themeCosts = {
        matrix: 50,
        sunset: 75,
        cyberpunk: 100,
        forest: 120
      };
      const cost = themeCosts[itemId];
      if (cost === undefined) {
        return res.status(400).json({ error: "Invalid theme ID requested." });
      }
      const unlockedThemes = settings.unlockedThemes || ["default"];
      if (unlockedThemes.includes(itemId)) {
        return res.status(400).json({ error: "Theme is already unlocked!" });
      }
      if ((settings.zenCoins || 0) < cost) {
        return res.status(400).json({ error: `Insufficient ZenCoins! Unlocking this theme costs ${cost} ZenCoins.` });
      }
      updates.zenCoins = settings.zenCoins - cost;
      updates.unlockedThemes = [...unlockedThemes, itemId];

    } else if (itemType === "custom_reward") {
      const customRewards = settings.customRewards || [];
      const reward = customRewards.find(r => r._id === itemId);
      if (!reward) {
        return res.status(404).json({ error: "Custom reward item not found." });
      }
      if ((settings.zenCoins || 0) < reward.cost) {
        return res.status(400).json({ error: `Insufficient ZenCoins! Redeeming this reward costs ${reward.cost} ZenCoins.` });
      }
      updates.zenCoins = settings.zenCoins - reward.cost;

    } else {
      return res.status(400).json({ error: "Invalid item type requested." });
    }

    const updated = await db.updateSettings(userId, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST equip unlocked theme
router.post("/shop/equip-theme", async (req, res) => {
  const userId = req.user.userId;
  const { themeId } = req.body;

  try {
    const settings = await db.getSettings(userId);
    const unlockedThemes = settings.unlockedThemes || ["default"];

    if (!unlockedThemes.includes(themeId) && themeId !== "default") {
      return res.status(400).json({ error: "You must purchase this theme first!" });
    }

    const updated = await db.updateSettings(userId, { activeTheme: themeId });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add a custom reward
router.post("/custom-rewards", async (req, res) => {
  const userId = req.user.userId;
  const { title, cost } = req.body;
  const rewardCost = Number(cost);

  if (!title || !title.trim() || isNaN(rewardCost) || rewardCost <= 0) {
    return res.status(400).json({ error: "Reward title and a positive cost value are required." });
  }

  try {
    const settings = await db.getSettings(userId);
    const customRewards = settings.customRewards || [];
    
    const newReward = {
      _id: "cr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: title.trim(),
      cost: rewardCost
    };

    const updated = await db.updateSettings(userId, {
      customRewards: [...customRewards, newReward]
    });

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a custom reward
router.delete("/custom-rewards/:id", async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const settings = await db.getSettings(userId);
    const customRewards = settings.customRewards || [];
    const updatedRewards = customRewards.filter(r => r._id !== id);

    const updated = await db.updateSettings(userId, {
      customRewards: updatedRewards
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
