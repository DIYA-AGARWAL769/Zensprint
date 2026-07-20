import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");

// Create data directory if it doesn't exist for JSON fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const GOALS_FILE = path.join(DATA_DIR, "goals.json");
const ROASTS_FILE = path.join(DATA_DIR, "roasts.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const SHAME_FILE = path.join(DATA_DIR, "shame_logs.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default preset roasts
const DEFAULT_ROASTS = [
  {
    _id: "preset_1",
    text: "Are you actually working or just breathing heavily near the keyboard?",
    category: "Rude",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_2",
    text: "My grandma writes code faster than you, and she's been dead since 2012.",
    category: "Rude",
    severity: "Toxic",
    isCustom: false
  },
  {
    _id: "preset_3",
    text: "Oh look, another tab opened. Is that for your career search, or are you just giving up?",
    category: "Rude",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_4",
    text: "You've been staring at this screen for 20 minutes. The code isn't going to write itself out of fear.",
    category: "Rude",
    severity: "Toxic",
    isCustom: false
  },
  {
    _id: "preset_5",
    text: "Go back to work before I start telling people what's on your search history.",
    category: "Rude",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_6",
    text: "A distraction a day keeps the progress away. Literally.",
    category: "Funny",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_7",
    text: "Focus is hard. Scrolling social media for 3 hours is easy. Choose your hard. Actually, don't choose the second one.",
    category: "Funny",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_8",
    text: "You are doing great! At getting absolutely nothing done.",
    category: "Funny",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_9",
    text: "Your goals are currently crying in the corner. Go comfort them.",
    category: "Funny",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_10",
    text: "Rumor has it that every time you get distracted, a developer's coffee goes cold. Don't be a coffee murderer.",
    category: "Funny",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_11",
    text: "Ah, another break. You must be exhausted from all that thinking about starting to work.",
    category: "Satirical",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_12",
    text: "Fascinating strategy. Let's see how ignoring your tasks leads to sudden wealth and success.",
    category: "Satirical",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_13",
    text: "Revolutionary approach to productivity: the 'do nothing and hope it resolves itself' method.",
    category: "Satirical",
    severity: "Spicy",
    isCustom: false
  },
  {
    _id: "preset_14",
    text: "Truly, your ability to avoid work is an art form. You should put it on your resume.",
    category: "Satirical",
    severity: "Mild",
    isCustom: false
  },
  {
    _id: "preset_15",
    text: "I'm sure that random video about ancient building techniques is crucial to your current goal.",
    category: "Satirical",
    severity: "Spicy",
    isCustom: false
  }
];

const DEFAULT_SETTINGS = {
  spiceLevel: "Spicy",
  categories: ["Rude", "Funny", "Satirical", "Custom"],
  customRoastSound: "",
  customSuccessSound: "",
  customSupportiveSound: "",
  zenCoins: 0,
  zenXP: 0,
  shields: 0,
  streak: 0,
  lastSprintDate: "",
  unlockedThemes: ["default"],
  activeTheme: "default",
  customRewards: [
    { _id: "cr_1", title: "Eat a slice of pizza / cheat meal 🍕", cost: 100 },
    { _id: "cr_2", title: "Play video games for 30 minutes 🎮", cost: 50 },
    { _id: "cr_3", title: "Watch one episode of Netflix 🍿", cost: 60 }
  ]
};

export const SHAME_CHORES = [
  "Do 10 jumping jacks to wake up your brain (2 mins max) 🏃",
  "Stare at a wall for 60 seconds (no phone allowed!) (1 min max) 🧱",
  "Clean 1 item on your desk (mug, keyboard) (2 mins max) 🧼",
  "Drink a large glass of water & reflect (1 min max) 💧",
  "Write a 1-sentence apology letter to your goals (2 mins max) 📝",
  "Take 5 slow deep breaths in the present moment (1 min max) 🧘",
  "Stand up & do a 30-second arm and neck stretch (1 min max) 🤸"
];

// State to track if MongoDB is active
let useMongo = false;

// Mongoose Schemas (if MongoDB is used)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  isShameChore: { type: Boolean, default: false },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  duration: { type: Number, default: 25 },
  createdAt: { type: Date, default: Date.now }
});

const RoastSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, default: null }, // Null for global presets
  text: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, required: true },
  isCustom: { type: Boolean, default: true }
});

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  spiceLevel: { type: String, default: "Spicy" },
  categories: { type: [String], default: ["Rude", "Funny", "Satirical", "Custom"] },
  customRoastSound: { type: String, default: "" },
  customSuccessSound: { type: String, default: "" },
  customSupportiveSound: { type: String, default: "" },
  customAlarmSound: { type: String, default: "" },
  zenCoins: { type: Number, default: 0 },
  zenXP: { type: Number, default: 0 },
  shields: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastSprintDate: { type: String, default: "" },
  unlockedThemes: { type: [String], default: ["default"] },
  activeTheme: { type: String, default: "default" },
  customRewards: {
    type: [{
      _id: { type: String, required: true },
      title: { type: String, required: true },
      cost: { type: Number, required: true }
    }],
    default: [
      { _id: "cr_1", title: "Eat a slice of pizza / cheat meal 🍕", cost: 100 },
      { _id: "cr_2", title: "Play video games for 30 minutes 🎮", cost: 50 },
      { _id: "cr_3", title: "Watch one episode of Netflix 🍿", cost: 60 }
    ]
  }
});

const ShameLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  siteBlocked: { type: String, default: "" },
  roastText: { type: String, required: true },
  explanation: { type: String, default: "" }
});

let MongoUser, MongoGoal, MongoRoast, MongoSettings, MongoShameLog;

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log("⚠️ MONGO_URI not found in env. Falling back to local JSON database mode.");
    initializeJSONdb();
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("🚀 Connected to MongoDB successfully.");
    useMongo = true;

    MongoUser = mongoose.model("User", UserSchema);
    MongoGoal = mongoose.model("Goal", GoalSchema);
    MongoRoast = mongoose.model("Roast", RoastSchema);
    MongoSettings = mongoose.model("Settings", SettingsSchema);
    MongoShameLog = mongoose.model("ShameLog", ShameLogSchema);

    // Populate default roasts in MongoDB if none exist
    const count = await MongoRoast.countDocuments();
    if (count === 0) {
      await MongoRoast.insertMany(DEFAULT_ROASTS);
      console.log("🌱 Populated default preset roasts into MongoDB.");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Falling back to local JSON database mode.");
    initializeJSONdb();
  }
}

// JSON Database Initialization
function initializeJSONdb() {
  if (!fs.existsSync(GOALS_FILE)) {
    fs.writeFileSync(GOALS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(ROASTS_FILE)) {
    fs.writeFileSync(ROASTS_FILE, JSON.stringify(DEFAULT_ROASTS, null, 2));
  }
  if (!fs.existsSync(SHAME_FILE)) {
    fs.writeFileSync(SHAME_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify([], null, 2));
  } else {
    // Migration: make sure settings file is an array
    try {
      const data = fs.readFileSync(SETTINGS_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify([], null, 2));
      }
    } catch (e) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify([], null, 2));
    }
  }
  console.log("📁 Local JSON database files initialized at:", DATA_DIR);
}

// Helpers for JSON DB operations
function readJSON(file) {
  try {
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
    return [];
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing file ${file}:`, err);
  }
}

// Unified API Interface
export const db = {
  // --- USERS ---
  async getUser(identifier) {
    if (!identifier) return null;
    const term = identifier.trim().toLowerCase();
    if (useMongo) {
      return await MongoUser.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${term}$`, "i") } },
          { email: { $regex: new RegExp(`^${term}$`, "i") } }
        ]
      });
    } else {
      const users = readJSON(USERS_FILE);
      return users.find((u) => 
        (u.username && u.username.toLowerCase() === term) ||
        (u.email && u.email.toLowerCase() === term)
      ) || null;
    }
  },

  async addUser(username, password, email = "", firstName = "", lastName = "") {
    if (useMongo) {
      const newUser = new MongoUser({ username, password, email, firstName, lastName });
      return await newUser.save();
    } else {
      const users = readJSON(USERS_FILE);
      const newUser = {
        _id: "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        username,
        email,
        firstName,
        lastName,
        password,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJSON(USERS_FILE, users);
      return newUser;
    }
  },

  // --- GOALS ---
  async getGoals(userId, date) {
    if (useMongo) {
      const query = { userId };
      if (date) query.date = date;
      return await MongoGoal.find(query).sort({ createdAt: -1 });
    } else {
      const goals = readJSON(GOALS_FILE);
      let filtered = goals.filter((g) => g.userId === userId);
      if (date) {
        filtered = filtered.filter((g) => g.date === date);
      }
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async addGoal(userId, title, isShameChore = false, date, duration = 25) {
    if (useMongo) {
      const newGoal = new MongoGoal({ userId, title, completed: false, isShameChore, date, duration });
      return await newGoal.save();
    } else {
      const goals = readJSON(GOALS_FILE);
      const newGoal = {
        _id: "goal_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        userId,
        title,
        completed: false,
        isShameChore,
        date,
        duration,
        createdAt: new Date().toISOString()
      };
      goals.push(newGoal);
      writeJSON(GOALS_FILE, goals);
      return newGoal;
    }
  },

  async updateGoal(userId, id, updates) {
    if (useMongo) {
      return await MongoGoal.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      const goals = readJSON(GOALS_FILE);
      const idx = goals.findIndex((g) => g._id === id && g.userId === userId);
      if (idx !== -1) {
        goals[idx] = { ...goals[idx], ...updates };
        writeJSON(GOALS_FILE, goals);
        return goals[idx];
      }
      return null;
    }
  },

  async deleteGoal(userId, id) {
    if (useMongo) {
      const goal = await MongoGoal.findOne({ _id: id, userId });
      if (goal && goal.isShameChore) {
        throw new Error("You cannot delete a shame chore! Complete it to clear it.");
      }
      return await MongoGoal.findOneAndDelete({ _id: id, userId });
    } else {
      const goals = readJSON(GOALS_FILE);
      const goal = goals.find((g) => g._id === id && g.userId === userId);
      if (goal && goal.isShameChore) {
        throw new Error("You cannot delete a shame chore! Complete it to clear it.");
      }
      const filtered = goals.filter((g) => !(g._id === id && g.userId === userId));
      writeJSON(GOALS_FILE, filtered);
      return { success: true };
    }
  },

  async getPastIncompleteGoals(userId, todayDate) {
    if (useMongo) {
      return await MongoGoal.find({
        userId,
        completed: false,
        date: { $lt: todayDate }
      }).sort({ date: 1 });
    } else {
      const goals = readJSON(GOALS_FILE);
      return goals
        .filter((g) => g.userId === userId && !g.completed && g.date < todayDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  },

  async rolloverGoals(userId, goalIds, todayDate) {
    if (useMongo) {
      await MongoGoal.updateMany(
        { _id: { $in: goalIds }, userId },
        { date: todayDate }
      );
      return { success: true };
    } else {
      const goals = readJSON(GOALS_FILE);
      const updatedGoals = goals.map((g) => {
        if (goalIds.includes(g._id) && g.userId === userId) {
          return { ...g, date: todayDate };
        }
        return g;
      });
      writeJSON(GOALS_FILE, updatedGoals);
      return { success: true };
    }
  },

  // --- ROASTS ---
  async getRoasts(userId) {
    if (useMongo) {
      return await MongoRoast.find({ $or: [{ userId }, { isCustom: false }] });
    } else {
      const roasts = readJSON(ROASTS_FILE);
      return roasts.filter((r) => !r.isCustom || r.userId === userId);
    }
  },

  async addRoast(userId, text, category, severity) {
    const roastId = "roast_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    if (useMongo) {
      const newRoast = new MongoRoast({ _id: roastId, userId, text, category, severity, isCustom: true });
      return await newRoast.save();
    } else {
      const roasts = readJSON(ROASTS_FILE);
      const newRoast = {
        _id: roastId,
        userId,
        text,
        category,
        severity,
        isCustom: true
      };
      roasts.push(newRoast);
      writeJSON(ROASTS_FILE, roasts);
      return newRoast;
    }
  },

  async updateRoast(userId, id, updates) {
    if (useMongo) {
      return await MongoRoast.findOneAndUpdate({ _id: id, userId, isCustom: true }, updates, { new: true });
    } else {
      const roasts = readJSON(ROASTS_FILE);
      const idx = roasts.findIndex((r) => r._id === id && r.userId === userId && r.isCustom);
      if (idx !== -1) {
        roasts[idx] = { ...roasts[idx], ...updates };
        writeJSON(ROASTS_FILE, roasts);
        return roasts[idx];
      }
      return null;
    }
  },

  async deleteRoast(userId, id) {
    if (useMongo) {
      return await MongoRoast.findOneAndDelete({ _id: id, userId, isCustom: true });
    } else {
      const roasts = readJSON(ROASTS_FILE);
      const filtered = roasts.filter((r) => !(r._id === id && r.userId === userId && r.isCustom));
      writeJSON(ROASTS_FILE, filtered);
      return { success: true };
    }
  },

  // Reset custom roasts back to default (keep presets only)
  async resetRoasts(userId) {
    if (useMongo) {
      await MongoRoast.deleteMany({ userId, isCustom: true });
      return await this.getRoasts(userId);
    } else {
      const roasts = readJSON(ROASTS_FILE);
      const filtered = roasts.filter((r) => !(r.userId === userId && r.isCustom));
      writeJSON(ROASTS_FILE, filtered);
      return filtered;
    }
  },

  // --- SETTINGS ---
  async getSettings(userId) {
    if (useMongo) {
      let settings = await MongoSettings.findOne({ userId });
      if (!settings) {
        settings = new MongoSettings({ userId, ...DEFAULT_SETTINGS });
        await settings.save();
      }
      return settings;
    } else {
      const settingsList = readJSON(SETTINGS_FILE);
      let settings = settingsList.find((s) => s.userId === userId);
      if (!settings) {
        settings = { userId, ...DEFAULT_SETTINGS };
        settingsList.push(settings);
        writeJSON(SETTINGS_FILE, settingsList);
      }
      return settings;
    }
  },

  async updateSettings(userId, updates) {
    if (useMongo) {
      let settings = await MongoSettings.findOne({ userId });
      if (!settings) {
        settings = new MongoSettings({ userId, ...DEFAULT_SETTINGS, ...updates });
      } else {
        Object.assign(settings, updates);
      }
      return await settings.save();
    } else {
      const settingsList = readJSON(SETTINGS_FILE);
      const idx = settingsList.findIndex((s) => s.userId === userId);
      if (idx !== -1) {
        settingsList[idx] = { ...settingsList[idx], ...updates };
        writeJSON(SETTINGS_FILE, settingsList);
        return settingsList[idx];
      } else {
        const newSettings = { userId, ...DEFAULT_SETTINGS, ...updates };
        settingsList.push(newSettings);
        writeJSON(SETTINGS_FILE, settingsList);
        return newSettings;
      }
    }
  },

  // --- SHAME LOGS ---
  async getShameLogs(userId) {
    if (useMongo) {
      return await MongoShameLog.find({ userId }).sort({ timestamp: -1 });
    } else {
      return readJSON(SHAME_FILE)
        .filter((l) => l.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  },

  async addShameLog(userId, siteBlocked, roastText) {
    if (useMongo) {
      const newLog = new MongoShameLog({ userId, siteBlocked, roastText, explanation: "" });
      return await newLog.save();
    } else {
      const logs = readJSON(SHAME_FILE);
      const newLog = {
        _id: "shame_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        userId,
        siteBlocked,
        roastText,
        explanation: "",
        timestamp: new Date().toISOString()
      };
      logs.push(newLog);
      writeJSON(SHAME_FILE, logs);
      return newLog;
    }
  },

  async clearShameLogs(userId) {
    if (useMongo) {
      await MongoShameLog.deleteMany({ userId });
      return { success: true };
    } else {
      const logs = readJSON(SHAME_FILE);
      const filtered = logs.filter((l) => l.userId !== userId);
      writeJSON(SHAME_FILE, filtered);
      return { success: true };
    }
  },

  async updateShameLogExplanation(userId, logId, explanation) {
    if (useMongo) {
      return await MongoShameLog.findOneAndUpdate(
        { _id: logId, userId },
        { explanation },
        { new: true }
      );
    } else {
      const logs = readJSON(SHAME_FILE);
      const idx = logs.findIndex((l) => l._id === logId && l.userId === userId);
      if (idx !== -1) {
        logs[idx].explanation = explanation;
        writeJSON(SHAME_FILE, logs);
        return logs[idx];
      }
      return null;
    }
  },

  async removeShameChore(userId, id) {
    if (useMongo) {
      return await MongoGoal.findOneAndDelete({ _id: id, userId });
    } else {
      const goals = readJSON(GOALS_FILE);
      const filtered = goals.filter((g) => !(g._id === id && g.userId === userId));
      writeJSON(GOALS_FILE, filtered);
      return { success: true };
    }
  }
};
