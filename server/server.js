import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import goalsRouter from "./routes/goals.js";
import roastsRouter from "./routes/roasts.js";
import settingsRouter from "./routes/settings.js";
import shameRouter from "./routes/shame.js";
import { authenticateToken } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Database Connection (MongoDB or JSON fallback)
connectDB();

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/goals", authenticateToken, goalsRouter);
app.use("/api/roasts", authenticateToken, roastsRouter);
app.use("/api/settings", authenticateToken, settingsRouter);
app.use("/api/shame", authenticateToken, shameRouter);

app.get("/", (req, res) => {
  res.send("Welcome to ZenSprint API 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});