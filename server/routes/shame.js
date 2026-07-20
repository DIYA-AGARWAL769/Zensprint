import express from "express";
import { db, SHAME_CHORES } from "../db.js";

const router = express.Router();

// GET shame logs
router.get("/", async (req, res) => {
  const userId = req.user.userId;
  try {
    const logs = await db.getShameLogs(userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add a shame log & auto-inject a shame chore!
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const { siteBlocked, date } = req.body;
  const source = siteBlocked || "Tab Switch";
  const todayDate = date || new Date().toISOString().split("T")[0];

  try {
    // 1. Fetch current settings to get active categories and spiceLevel
    const settings = await db.getSettings(userId);
    const roasts = await db.getRoasts(userId);

    // Check if shield is available and active
    const activeShields = settings.shields ?? settings.excuseShields ?? 0;
    if (activeShields > 0) {
      const remainingShields = activeShields - 1;
      await db.updateSettings(userId, { shields: remainingShields, excuseShields: remainingShields });
      
      const shieldRoastText = `Excuse Shield consumed! Focus Cop shielded you from getting a Shame Chore. Get back to work!`;
      const shieldedSource = `${source} (Shielded 🛡️)`;
      const newLog = await db.addShameLog(userId, shieldedSource, shieldRoastText);

      return res.status(201).json({
        success: true,
        log: newLog,
        roastText: shieldRoastText,
        chore: null,
        shieldConsumed: true
      });
    }

    // 2. Filter roasts matching current active configuration
    const userCategories = Array.isArray(settings.categories) 
      ? settings.categories 
      : ["Rude", "Funny", "Satirical", "Custom"];
    const spiceLevel = settings.spiceLevel || "Spicy";

    let pool = roasts.filter((r) => {
      const allowedCat = userCategories.includes(r.category);
      let allowedSev = false;
      if (spiceLevel === "Mild") {
        allowedSev = r.severity === "Mild";
      } else if (spiceLevel === "Spicy") {
        allowedSev = r.severity === "Mild" || r.severity === "Spicy";
      } else if (spiceLevel === "Toxic") {
        allowedSev = true;
      }
      return allowedCat && allowedSev;
    });

    if (pool.length === 0) {
      pool = roasts.length > 0 ? roasts : [
        { text: "Stop dilly-dallying. Get back to sprinting!", category: "Rude", severity: "Mild" }
      ];
    }

    // 3. Pick a random roast
    const randomRoast = pool[Math.floor(Math.random() * pool.length)];
    const roastText = randomRoast.text;

    // 4. Create the shame log entry
    const newLog = await db.addShameLog(userId, source, roastText);

    // 5. Select a random shame chore (capped at 2 mins max) and inject it into goals list
    const randomChore = SHAME_CHORES[Math.floor(Math.random() * SHAME_CHORES.length)];
    const choreTitle = `[SHAME CHORE] ${randomChore}`;
    const injectedChore = await db.addGoal(userId, choreTitle, true, todayDate, 2); // 2 mins max!

    res.status(201).json({
      success: true,
      log: newLog,
      roastText,
      chore: injectedChore
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST clear all shame logs
router.post("/clear", async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.clearShameLogs(userId);
    res.json({ success: true, message: "Shame wall cleared!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST explain distraction and waive shame chore
router.post("/explain", async (req, res) => {
  const userId = req.user.userId;
  const { logId, choreId, explanation } = req.body;

  if (!logId || !explanation) {
    return res.status(400).json({ error: "Missing logId or explanation." });
  }

  try {
    // 1. Update shame log with user explanation
    const updatedLog = await db.updateShameLogExplanation(userId, logId, explanation);
    if (!updatedLog) {
      return res.status(404).json({ error: "Shame log not found or unauthorized." });
    }

    // 2. Waive/remove the assigned shame chore if present
    if (choreId) {
      await db.removeShameChore(userId, choreId);
    }

    res.json({
      success: true,
      message: "Explanation submitted. Penalty waived!",
      log: updatedLog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
