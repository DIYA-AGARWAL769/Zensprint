import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  ShieldAlert, 
  Gift, 
  Terminal, 
  Target, 
  Sparkles, 
  Calendar,
  Layers,
  LayoutDashboard
} from "lucide-react";
import { apiFetch } from "../utils/api";
import { 
  playStartSound, 
  playSuccessSound, 
  playRoastSound, 
  playSupportiveSound, 
  playWarningSound,
  speakRoast,
  startContinuousAlarm,
  stopContinuousAlarm,
  unlockAudio,
  isAlarmArmed,
  showDesktopNotification
} from "../utils/audio";

// Sub-components
import LevelHeader from "./dashboard/LevelHeader";
import TimerCard from "./dashboard/TimerCard";
import SupportiveBanner from "./dashboard/SupportiveBanner";
import GoalList from "./dashboard/GoalList";
import ZenShop from "./dashboard/ZenShop";
import ShameLogsView from "./dashboard/ShameLogsView";
import ExtensionView from "./dashboard/ExtensionView";
import RoastModal from "./dashboard/RoastModal";
import StrictFocusPanel from "./dashboard/StrictFocusPanel";

const BLOCKED_DOMAINS = [
  "youtube.com", "reddit.com", "facebook.com", "twitter.com",
  "instagram.com", "tiktok.com", "linkedin.com", "netflix.com",
  "twitch.tv", "discord.com", "pinterest.com"
];

const MOTIVATIONAL_QUOTES = [
  "That's completely fine! Progress isn't linear. Every day is a clean slate to do your best. 🌟",
  "Don't stress over what didn't get done yesterday. Today is a fresh start and a new chance to make progress. 💪",
  "Mistakes and incomplete lists are proof that you are trying. Take a breath, reset, and tackle today with fresh energy. ✨",
  "Yesterday is gone. Do not let the weight of unfinished tasks hold back your speed today. One step at a time! 🏃",
  "A new day means new opportunities. Your past self was doing their best; your present self can take it from here. 🌅",
  "Be gentle with yourself. Productivity is a journey, not a race. You have a brand new day ahead of you! 🧘"
];

const getLevelInfo = (xp = 0) => {
  const levels = [
    { name: "Focus Novice 🎯", minXp: 0, maxXp: 100 },
    { name: "Sprint Padawan ⚔️", minXp: 100, maxXp: 300 },
    { name: "Zen Initiate 🧘", minXp: 300, maxXp: 600 },
    { name: "Task Conqueror ⚡", minXp: 600, maxXp: 1005 },
    { name: "Distraction Slayer 🛡️", minXp: 1005, maxXp: 1500 },
    { name: "Sprint Samurai 🥷", minXp: 1500, maxXp: 2100 },
    { name: "Willpower Warrior 🏋️", minXp: 2100, maxXp: 2800 },
    { name: "Zen Master 🕉️", minXp: 2800, maxXp: 3600 },
    { name: "Productivity Shogun 👑", minXp: 3600, maxXp: 4500 },
    { name: "Ascended Focus God 🌌", minXp: 4500, maxXp: Infinity }
  ];
  
  let currentLevelIdx = 0;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp && xp < levels[i].maxXp) {
      currentLevelIdx = i;
      break;
    }
  }
  if (xp >= 4500) currentLevelIdx = 9;
  
  const levelNum = currentLevelIdx + 1;
  const levelName = levels[currentLevelIdx].name;
  const minXp = levels[currentLevelIdx].minXp;
  const maxXp = levels[currentLevelIdx].maxXp;
  const progressPercent = maxXp === Infinity ? 100 : Math.round(((xp - minXp) / (maxXp - minXp)) * 100);
  
  return { levelNum, levelName, minXp, maxXp, progressPercent };
};

export default function Dashboard() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDateStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayDateStr);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  const [goals, setGoals] = useState([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalDuration, setNewGoalDuration] = useState(25);
  const [roasts, setRoasts] = useState([]);
  const [settings, setSettings] = useState({ spiceLevel: "Spicy", categories: [] });
  const [shameLogs, setShameLogs] = useState([]);
  
  // Focused goal details
  const [focusedGoal, setFocusedGoal] = useState(null);
  
  // Past incomplete goals check (supportive notification)
  const [pastIncompleteGoals, setPastIncompleteGoals] = useState([]);
  const [showSupportiveBanner, setShowSupportiveBanner] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Dashboard Sub-Tabs: "sprint" | "shop" | "shame" | "extension"
  const [activeSubTab, setActiveSubTab] = useState("sprint");

  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLimit, setTimerLimit] = useState(25 * 60);
  
  // Alerts & Modals
  const [activeRoast, setActiveRoast] = useState(null);
  const [explanationText, setExplanationText] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [choreError, setChoreError] = useState(null);

  // Excused break timer state
  const [excusedUntil, setExcusedUntil] = useState(() => {
    const val = localStorage.getItem("zensprint_excused_until");
    return val ? parseInt(val, 10) : 0;
  });
  const [excusedReason, setExcusedReason] = useState(() => {
    return localStorage.getItem("zensprint_excused_reason") || "";
  });
  const [unblockedSite, setUnblockedSite] = useState(() => {
    return localStorage.getItem("zensprint_unblocked_site") || "";
  });
  const [selectedSiteToUnblock, setSelectedSiteToUnblock] = useState("");
  const [excuseDuration, setExcuseDuration] = useState(0);
  const [excusedTimeLeft, setExcusedTimeLeft] = useState(0);
  const [selectedBlockedDomains, setSelectedBlockedDomains] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zensprint_blocked_domains") || "null");
      return Array.isArray(saved) ? saved.filter((domain) => BLOCKED_DOMAINS.includes(domain)) : BLOCKED_DOMAINS;
    } catch { return BLOCKED_DOMAINS; }
  });

  const toggleBlockedDomain = (domain) => {
    setSelectedBlockedDomains((current) => {
      const next = current.includes(domain) ? current.filter((item) => item !== domain) : [...current, domain];
      localStorage.setItem("zensprint_blocked_domains", JSON.stringify(next));
      return next;
    });
  };

  // Shop Forms
  const [rewardFormTitle, setRewardFormTitle] = useState("");
  const [rewardFormCost, setRewardFormCost] = useState("50");
  
  const timerRunningRef = useRef(timerRunning);
  useEffect(() => {
    timerRunningRef.current = timerRunning;
  }, [timerRunning]);

  const excusedUntilRef = useRef(excusedUntil);
  useEffect(() => {
    excusedUntilRef.current = excusedUntil;
  }, [excusedUntil]);

  // Master Data Fetcher with resilient Promise.allSettled
  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        apiFetch(`/goals?date=${selectedDate}`),
        apiFetch("/roasts"),
        apiFetch("/settings"),
        apiFetch("/shame"),
        apiFetch("/goals/past-incomplete")
      ]);

      const [goalsRes, roastsRes, settingsRes, shameRes, pastRes] = results;

      if (goalsRes.status === "fulfilled" && goalsRes.value.ok) {
        const goalsData = await goalsRes.value.json();
        setGoals(goalsData);
      }

      if (roastsRes.status === "fulfilled" && roastsRes.value.ok) {
        const roastsData = await roastsRes.value.json();
        setRoasts(roastsData);
      }

      if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
        const settingsData = await settingsRes.value.json();
        setSettings(settingsData);
      }

      if (shameRes.status === "fulfilled" && shameRes.value.ok) {
        const shameData = await shameRes.value.json();
        setShameLogs(Array.isArray(shameData) ? shameData : []);
      }

      if (pastRes.status === "fulfilled" && pastRes.value.ok) {
        const pastData = await pastRes.value.json();
        setPastIncompleteGoals(Array.isArray(pastData) ? pastData : []);
        if (Array.isArray(pastData) && pastData.length > 0) {
          setShowSupportiveBanner(true);
          const randomQ = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
          setMotivationalQuote(randomQ);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // Fetch initial dashboard data & refresh on date change
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Handle Chrome Extension redirect parameter (?distracted_by=domain.com)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const distractedBy = params.get("distracted_by");
    if (distractedBy) {
      // Clean query parameter from browser address bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      const logExtensionDistraction = async () => {
        try {
          const res = await apiFetch("/shame", {
            method: "POST",
            body: { siteBlocked: distractedBy, date: selectedDate }
          });
          const data = await res.json();

          if (data.shieldConsumed) {
            setActiveRoast({
              prefix: "🛡️ Excuse Shield Active!",
              text: data.roastText,
              severity: "Mild",
              category: "Satirical",
              logId: data.log?._id,
              choreId: null,
              isShielded: true
            });
          } else {
            setActiveRoast({
              prefix: `Blocked Site: ${distractedBy} 🚨`,
              text: data.roastText,
              severity: "Toxic",
              category: "Funny",
              logId: data.log?._id,
              choreId: data.chore?._id,
              chore: data.chore,
              blockedSite: distractedBy,
              isShielded: false
            });
          }

          playRoastSound();
          showDesktopNotification(`Blocked Site: ${distractedBy}`, data.roastText);
          fetchData();
        } catch (err) {
          console.error("Failed to log extension distraction:", err);
        }
      };
      logExtensionDistraction();
    }
  }, []);

  const handleClearShameLogs = async () => {
    try {
      const res = await apiFetch("/shame/clear", { method: "POST" });
      if (res.ok) {
        setShameLogs([]);
        setSuccessMessage("Distraction history (Shame Wall) cleared!");
      }
    } catch (err) {
      console.error("Error clearing shame logs:", err);
      playWarningSound();
    }
  };

  // Unlock AudioContext & arm alarm oscillator on ANY user gesture
  // Using document-level listeners + multiple event types for maximum reliability
  useEffect(() => {
    const handleUserGesture = () => {
      unlockAudio();
    };
    document.addEventListener("click", handleUserGesture, true);
    document.addEventListener("mousedown", handleUserGesture, true);
    document.addEventListener("touchstart", handleUserGesture, true);
    document.addEventListener("keydown", handleUserGesture, true);
    return () => {
      document.removeEventListener("click", handleUserGesture, true);
      document.removeEventListener("mousedown", handleUserGesture, true);
      document.removeEventListener("touchstart", handleUserGesture, true);
      document.removeEventListener("keydown", handleUserGesture, true);
    };
  }, []);

  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
  });

  const requestNotifPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setNotifPermission(res);
        if (res === "granted") {
          showDesktopNotification("ZenSprint Notifications Active! 🚨", "You will get instant popups when switching tabs.");
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const alarmOnRef = useRef(false);
  const titleBlinkIntervalRef = useRef(null);
  const notificationIntervalRef = useRef(null);

  // VisibilityChange listener — MUST have [] deps so React never re-runs cleanup and kills the alarm
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const isExcused = excusedUntilRef.current > Date.now();

      if (document.hidden && !isExcused) {
        alarmOnRef.current = true;
        const fallbackText = "Tab switch detected! Get back to your sprint goals immediately.";

        // 1. Turn on the alarm (oscillator + custom sound if configured)
        startContinuousAlarm(settingsRef.current?.customAlarmSound);

        // 2. Continuous title blinking loop while away
        if (!titleBlinkIntervalRef.current) {
          let flag = false;
          titleBlinkIntervalRef.current = setInterval(() => {
            document.title = flag ? "🚨 GET BACK TO SPRINT! 🚨" : "⚠️ DISTRACTION DETECTED! ⚠️";
            flag = !flag;
          }, 800);
        }

        // 3. Desktop notifications
        showDesktopNotification("Tab Switch Detected! 🚨", fallbackText);
        speakRoast(fallbackText);

        if (!notificationIntervalRef.current) {
          notificationIntervalRef.current = setInterval(() => {
            if (document.hidden) {
              showDesktopNotification("🚨 GET BACK TO WORK!", "You switched tabs! Return to ZenSprint immediately.");
            }
          }, 3500);
        }

        // 4. Log the incident to backend
        try {
          const res = await apiFetch("/shame", {
            method: "POST",
            body: { siteBlocked: "Tab Switch", date: selectedDateRef.current }
          });
          const data = await res.json();

          setActiveRoast({
            prefix: "Tab Switch Detected!",
            text: data.roastText || fallbackText,
            severity: "Spicy",
            category: "Funny",
            logId: data.log?._id,
            choreId: data.chore?._id,
            chore: data.chore,
            isShielded: data.shieldConsumed
          });
          setSuccessMessage(null);
          fetchData();
        } catch (err) {
          console.error("Failed to log tab switch:", err);
        }

      } else if (!document.hidden) {
        // User returned back to the website! Stop alarm & restore title
        alarmOnRef.current = false;
        stopContinuousAlarm();

        if (titleBlinkIntervalRef.current) {
          clearInterval(titleBlinkIntervalRef.current);
          titleBlinkIntervalRef.current = null;
        }

        if (notificationIntervalRef.current) {
          clearInterval(notificationIntervalRef.current);
          notificationIntervalRef.current = null;
        }

        document.title = "ZenSprint - Focus";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Excused Timer Tick
  useEffect(() => {
    let interval = null;
    if (excusedUntil > Date.now()) {
      const updateExcused = () => {
        const rem = Math.max(0, Math.ceil((excusedUntil - Date.now()) / 1000));
        setExcusedTimeLeft(rem);
        if (rem <= 0) {
          setExcusedUntil(0);
          setExcusedReason("");
          setUnblockedSite("");
          localStorage.removeItem("zensprint_excused_until");
          localStorage.removeItem("zensprint_excused_reason");
          localStorage.removeItem("zensprint_unblocked_site");
        }
      };
      updateExcused();
      interval = setInterval(updateExcused, 1000);
    } else {
      setExcusedTimeLeft(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [excusedUntil]);

  const triggerManualRoast = async (type) => {
    try {
      const source = type === "pause" ? "Manual Pause" : "Distraction Button";
      const res = await apiFetch("/shame", {
        method: "POST",
        body: { siteBlocked: source, date: selectedDate }
      });
      const data = await res.json();
      const prefix = type === "pause" ? "Taking a break already?" : "Self-reported distraction!";

      // Start continuous warning alarm beep!
      startContinuousAlarm();

      setActiveRoast({
        prefix,
        text: data.roastText,
        severity: settings.spiceLevel,
        category: "Rude",
        logId: data.log?._id,
        choreId: data.chore?._id,
        chore: data.chore,
        isShielded: data.shieldConsumed
      });
      playRoastSound(settings?.customRoastSound);
      showDesktopNotification(prefix, data.roastText);
      setSuccessMessage(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitExplanation = async () => {
    if (!explanationText.trim()) return;

    // Stop continuous warning alarm beep on unlock
    stopContinuousAlarm();

    try {
      const res = await apiFetch("/shame/explain", {
        method: "POST",
        body: {
          logId: activeRoast.logId,
          choreId: activeRoast.choreId,
          explanation: explanationText
        }
      });
      await res.json();
      
      let message = "Justification accepted. The shame chore has been waived!";
      if (excuseDuration > 0) {
        const until = Date.now() + excuseDuration * 60 * 1000;
        setExcusedUntil(until);
        setExcusedReason(explanationText);
        localStorage.setItem("zensprint_excused_until", until.toString());
        localStorage.setItem("zensprint_excused_reason", explanationText);

        const siteToUnblock = activeRoast.blockedSite || selectedSiteToUnblock || "";
        setUnblockedSite(siteToUnblock);
        localStorage.setItem("zensprint_unblocked_site", siteToUnblock);

        message = siteToUnblock 
          ? `Justification accepted. Excused for ${excuseDuration} mins. ${siteToUnblock} is unblocked.` 
          : `Justification accepted. Excused for ${excuseDuration} mins.`;
      }
      
      setSuccessMessage(message);
      setActiveRoast(null);
      setExplanationText("");
      setExcuseDuration(0);
      setSelectedSiteToUnblock("");
      fetchData();
      triggerConfetti();
    } catch (err) {
      console.error("Error submitting explanation:", err);
      playWarningSound();
    }
  };

  const handleResumeStrictFocus = () => {
    setExcusedUntil(0);
    setExcusedReason("");
    setUnblockedSite("");
    localStorage.removeItem("zensprint_excused_until");
    localStorage.removeItem("zensprint_excused_reason");
    localStorage.removeItem("zensprint_unblocked_site");
    setSuccessMessage("Strict focus mode resumed. Back to work!");
    playStartSound();
  };

  const handleStartExcusedBreak = (durationMins, reasonText) => {
    const until = Date.now() + durationMins * 60 * 1000;
    setExcusedUntil(until);
    setExcusedReason(reasonText || "Authorized Break");
    setExcusedTimeLeft(durationMins * 60);
    localStorage.setItem("zensprint_excused_until", until.toString());
    localStorage.setItem("zensprint_excused_reason", reasonText || "Authorized Break");
    stopContinuousAlarm();
    setSuccessMessage(`Excused Break active for ${durationMins} minutes (${reasonText || 'Authorized Break'}). Enjoy your study session! ☕`);
    triggerConfetti();
    playSuccessSound(settings?.customSuccessSound);
  };

  const toggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      triggerManualRoast("pause");
    } else {
      setTimerRunning(true);
      setExcusedUntil(0);
      setExcusedReason("");
      setUnblockedSite("");
      localStorage.removeItem("zensprint_excused_until");
      localStorage.removeItem("zensprint_excused_reason");
      localStorage.removeItem("zensprint_unblocked_site");
      playStartSound();
      setActiveRoast(null);
      setSuccessMessage(null);
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setExcusedUntil(0);
    setExcusedReason("");
    setUnblockedSite("");
    localStorage.removeItem("zensprint_excused_until");
    localStorage.removeItem("zensprint_excused_reason");
    localStorage.removeItem("zensprint_unblocked_site");
    const duration = focusedGoal ? focusedGoal.duration : 25;
    setTimeLeft(duration * 60);
    setTimerLimit(duration * 60);
    setActiveRoast(null);
    setSuccessMessage(null);
  };

  const handleTimerComplete = async () => {
    setExcusedUntil(0);
    setExcusedReason("");
    setUnblockedSite("");
    localStorage.removeItem("zensprint_excused_until");
    localStorage.removeItem("zensprint_excused_reason");
    localStorage.removeItem("zensprint_unblocked_site");

    try {
      const body = { duration: focusedGoal ? focusedGoal.duration : 25 };
      if (focusedGoal) body.goalId = focusedGoal._id;
      
      const res = await apiFetch("/settings/sprint-complete", { method: "POST", body });
      const data = await res.json();
      
      if (data.success) {
        const message = `Sprint finished! (+${data.coinsAwarded} ZenCoins, +${data.xpAwarded} XP, Streak: 🔥 ${data.streak} days)`;
        setSuccessMessage(message);
        setFocusedGoal(null);
        setTimeLeft(25 * 60);
        setTimerLimit(25 * 60);
        fetchData();
        triggerConfetti();
        playSuccessSound(settings?.customSuccessSound);
        setActiveRoast(null);
      }
    } catch (err) {
      console.error("Error completing sprint timer:", err);
    }
  };

  // Shop Handlers
  const handleBuyItem = async (itemType, itemId = "") => {
    try {
      const res = await apiFetch("/settings/shop/buy", {
        method: "POST",
        body: { itemType, itemId }
      });
      const data = await res.json();
      if (!res.ok) {
        setChoreError(data.error || "Purchase failed.");
        playWarningSound();
        setTimeout(() => setChoreError(null), 4000);
        return;
      }
      setSettings(data);
      triggerConfetti();
      playSuccessSound(data.customSuccessSound);
      setSuccessMessage("Purchase successful!");
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const handleEquipTheme = async (themeId) => {
    try {
      const res = await apiFetch("/settings/shop/equip-theme", {
        method: "POST",
        body: { themeId }
      });
      const data = await res.json();
      if (!res.ok) return;
      setSettings(data);
      playSuccessSound(data.customSuccessSound);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomReward = async (e) => {
    e.preventDefault();
    if (!rewardFormTitle.trim() || !rewardFormCost) return;
    try {
      const res = await apiFetch("/settings/custom-rewards", {
        method: "POST",
        body: { title: rewardFormTitle.trim(), cost: rewardFormCost }
      });
      const data = await res.json();
      setSettings(data);
      setRewardFormTitle("");
      setRewardFormCost("50");
      playSuccessSound(data.customSuccessSound);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomReward = async (id) => {
    try {
      const res = await apiFetch(`/settings/custom-rewards/${id}`, { method: "DELETE" });
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      const res = await apiFetch("/settings/shop/buy", {
        method: "POST",
        body: { itemType: "custom_reward", itemId: reward._id }
      });
      const data = await res.json();
      if (!res.ok) return;
      setSettings(data);
      triggerConfetti();
      playSuccessSound(data.customSuccessSound);
      setSuccessMessage(`Reward Redeemed! Go enjoy: ${reward.title} 🎉`);
    } catch (err) {
      console.error(err);
    }
  };

  // Goals CRUD
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    try {
      const res = await apiFetch("/goals", {
        method: "POST",
        body: { 
          title: newGoalText,
          date: selectedDate,
          duration: newGoalDuration
        }
      });
      const newGoal = await res.json();
      setGoals([newGoal, ...goals]);
      setNewGoalText("");
      setNewGoalDuration(25);
      playSuccessSound(settings?.customSuccessSound);
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const handleToggleGoal = async (id, currentCompleted) => {
    try {
      const res = await apiFetch(`/goals/${id}`, {
        method: "PUT",
        body: { completed: !currentCompleted }
      });
      const updatedGoal = await res.json();
      setGoals(goals.map(g => g._id === id ? updatedGoal : g));
      
      if (!currentCompleted && focusedGoal && focusedGoal._id === id) {
        setFocusedGoal(null);
        setTimeLeft(25 * 60);
        setTimerLimit(25 * 60);
      }

      if (!currentCompleted) {
        triggerConfetti();
        playSuccessSound(settings?.customSuccessSound);
        if (updatedGoal.isShameChore) {
          setSuccessMessage("🔥 Shame Chore completed! +1 ZenCoin & +1 XP discipline reward earned 🪙");
        } else {
          setSuccessMessage("Goal completed! (+10 ZenCoins, +50 XP)");
        }
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id, isShameChore) => {
    if (isShameChore) {
      setChoreError("You cannot delete a shame chore! Complete it to build self-discipline.");
      playWarningSound();
      setTimeout(() => setChoreError(null), 4000);
      return;
    }

    try {
      await apiFetch(`/goals/${id}`, { method: "DELETE" });
      setGoals(goals.filter(g => g._id !== id));
      if (focusedGoal && focusedGoal._id === id) {
        setFocusedGoal(null);
        resetTimer();
      }
      playSuccessSound(settings?.customSuccessSound);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteModalChore = async (choreId) => {
    stopContinuousAlarm();
    if (choreId) {
      await handleToggleGoal(choreId, false);
    }
    setActiveRoast(null);
  };

  const levelInfo = getLevelInfo(settings?.zenXP || 0);
  const themeClass = settings?.equippedTheme || "default";

  return (
    <div className={`min-h-screen px-4 py-8 md:px-10 font-sans ${themeClass}`}>
      <div className="mx-auto max-w-6xl">

        {/* Level & Currency Top Header */}
        <LevelHeader
          levelInfo={levelInfo}
          zenXP={settings?.zenXP || 0}
          coins={settings?.zenCoins || 0}
          streak={settings?.streak || 0}
          activeShields={settings?.excuseShields || 0}
          theme={themeClass}
        />

        {/* Navigation Tabs Bar */}
        <div className="glass-card rounded-2xl p-2 mb-8 flex flex-wrap gap-2 justify-center sm:justify-start border border-slate-800/80 shadow-md">
          <button
            onClick={() => setActiveSubTab("sprint")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "sprint"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Focus & Sprint ⚡
          </button>

          <button
            onClick={() => setActiveSubTab("shop")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "shop"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Gift className="h-4 w-4" /> Zen Shop 🛍️
          </button>

          <button
            onClick={() => setActiveSubTab("shame")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "shame"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Flame className="h-4 w-4 text-red-400" /> Shame Logs 🚨
          </button>

          <button
            onClick={() => setActiveSubTab("extension")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "extension"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Terminal className="h-4 w-4" /> Extension Setup 🧩
          </button>
        </div>

        {/* Global Toast Message */}
        {successMessage && (
          <div className="mb-6 rounded-2xl bg-teal-950/40 border border-teal-500/40 p-4 text-xs font-bold text-teal-200 text-center shadow-lg animate-in fade-in">
            {successMessage}
          </div>
        )}

        {/* --- VIEW 1: FOCUS & SPRINT --- */}
        {activeSubTab === "sprint" && (
          <div className="space-y-6">
            
            {/* Strict Focus & Break Control Panel */}
            <StrictFocusPanel
              excusedTimeLeft={excusedTimeLeft}
              excusedReason={excusedReason}
              unblockedSite={unblockedSite}
              handleResumeStrictFocus={handleResumeStrictFocus}
              onStartExcusedBreak={handleStartExcusedBreak}
              timerRunning={timerRunning}
              focusedGoal={focusedGoal}
            />

            {/* Supportive Motivational Quote Banner (If past tasks were incomplete) */}
            {showSupportiveBanner && (
              <SupportiveBanner
                quote={motivationalQuote}
                pastGoals={pastIncompleteGoals}
                onClose={() => setShowSupportiveBanner(false)}
              />
            )}

            {/* Main Grid: Timer Card (Left) + Goal List (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
              
              <TimerCard
                timeLeft={timeLeft}
                timerLimit={timerLimit}
                timerRunning={timerRunning}
                toggleTimer={toggleTimer}
                resetTimer={resetTimer}
                focusedGoal={focusedGoal}
                setFocusedGoal={setFocusedGoal}
                setTimeLeft={setTimeLeft}
                setTimerLimit={setTimerLimit}
                triggerManualRoast={triggerManualRoast}
                excusedTimeLeft={excusedTimeLeft}
                excusedReason={excusedReason}
                unblockedSite={unblockedSite}
                handleResumeStrictFocus={handleResumeStrictFocus}
              />

              <GoalList
                goals={goals}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                todayDateStr={todayDateStr}
                newGoalText={newGoalText}
                setNewGoalText={setNewGoalText}
                newGoalDuration={newGoalDuration}
                setNewGoalDuration={setNewGoalDuration}
                handleAddGoal={handleAddGoal}
                handleToggleGoal={handleToggleGoal}
                handleDeleteGoal={handleDeleteGoal}
                focusedGoal={focusedGoal}
                setFocusedGoal={setFocusedGoal}
                setTimeLeft={setTimeLeft}
                setTimerLimit={setTimerLimit}
                choreError={choreError}
              />

            </div>

          </div>
        )}

        {/* --- VIEW 2: ZEN SHOP --- */}
        {activeSubTab === "shop" && (
          <ZenShop
            settings={settings}
            handleBuyItem={handleBuyItem}
            handleEquipTheme={handleEquipTheme}
            handleAddCustomReward={handleAddCustomReward}
            handleDeleteCustomReward={handleDeleteCustomReward}
            handleRedeemReward={handleRedeemReward}
            rewardFormTitle={rewardFormTitle}
            setRewardFormTitle={setRewardFormTitle}
            rewardFormCost={rewardFormCost}
            setRewardFormCost={setRewardFormCost}
          />
        )}

        {/* --- VIEW 3: SHAME LOGS --- */}
        {activeSubTab === "shame" && (
          <ShameLogsView 
            shameLogs={shameLogs} 
            onClearShameLogs={handleClearShameLogs} 
            onTriggerRoast={triggerManualRoast}
          />
        )}

        {/* --- VIEW 4: EXTENSION SETUP --- */}
        {activeSubTab === "extension" && (
          <ExtensionView blockedDomains={BLOCKED_DOMAINS} selectedBlockedDomains={selectedBlockedDomains} onToggleDomain={toggleBlockedDomain} />
        )}

        {/* Glassmorphic Roast & Excuse Modal */}
        <RoastModal
          activeRoast={activeRoast}
          onClose={() => {
            stopContinuousAlarm();
            setActiveRoast(null);
          }}
          onCompleteChore={handleCompleteModalChore}
          explanationText={explanationText}
          setExplanationText={setExplanationText}
          handleSubmitExplanation={handleSubmitExplanation}
          excuseDuration={excuseDuration}
          setExcuseDuration={setExcuseDuration}
          selectedSiteToUnblock={selectedSiteToUnblock}
          setSelectedSiteToUnblock={setSelectedSiteToUnblock}
          blockedDomains={BLOCKED_DOMAINS}
        />

        {/* Alarm & Notification Status Indicators (bottom-right corner) */}
        <div 
          style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
            display: 'flex', gap: '8px', alignItems: 'center'
          }}
        >
          {/* Notification Permission Badge */}
          <div
            onClick={requestNotifPermission}
            style={{
              padding: '8px 14px', borderRadius: 12, fontSize: 11, fontWeight: 'bold',
              background: notifPermission === 'granted' ? '#065f46' : '#7f1d1d',
              border: notifPermission === 'granted' ? '1px solid #10b981' : '1px solid #ef4444',
              color: 'white', cursor: 'pointer', userSelect: 'none'
            }}
            title="Click to enable or test desktop notification popups"
          >
            {notifPermission === 'granted' ? '🔔 Notifications On ✅' : '🔔 Click to Allow Notifications ⚠️'}
          </div>

          {/* Sound Alarm Badge */}
          <div 
            onClick={() => { unlockAudio(); requestNotifPermission(); }}
            style={{
              padding: '8px 14px', borderRadius: 12, fontSize: 11, fontWeight: 'bold',
              background: isAlarmArmed() ? '#065f46' : '#7f1d1d',
              border: isAlarmArmed() ? '1px solid #10b981' : '1px solid #ef4444',
              color: 'white', cursor: 'pointer', userSelect: 'none'
            }}
          >
            {isAlarmArmed() ? '🔊 Alarm Armed ✅' : '🔇 Click to Arm Alarm'}
          </div>
        </div>

      </div>
    </div>
  );
}
