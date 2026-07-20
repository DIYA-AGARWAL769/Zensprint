import { useState, useEffect } from "react";
import { 
  Flame, 
  Settings2, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  RotateCcw,
  Edit2,
  Volume2,
  Music,
  Sliders,
  ChevronDown
} from "lucide-react";
import confetti from "canvas-confetti";
import { apiFetch } from "../utils/api";
import { playSuccessSound, playWarningSound, playRoastSound, startContinuousAlarm, stopContinuousAlarm } from "../utils/audio";

const PRESET_SOUNDS = ["Retro Beep", "Zen Bell", "System Alarm", "Brass Horn"];
const isPreset = (sound) => PRESET_SOUNDS.includes(sound);

export default function RoastSettings() {
  const [roasts, setRoasts] = useState([]);
  const [settings, setSettings] = useState({ spiceLevel: "Spicy", categories: [] });
  
  // Custom Roast Form States
  const [newRoastText, setNewRoastText] = useState("");
  const [newRoastCategory, setNewRoastCategory] = useState("Custom");
  const [newRoastSeverity, setNewRoastSeverity] = useState("Spicy");
  
  // Editing Roast States
  const [editingRoastId, setEditingRoastId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSeverity, setEditSeverity] = useState("");

  // Custom Sound URL States
  const [roastSoundUrl, setRoastSoundUrl] = useState("");
  const [successSoundUrl, setSuccessSoundUrl] = useState("");
  const [supportiveSoundUrl, setSupportiveSoundUrl] = useState("");
  const [alarmSoundUrl, setAlarmSoundUrl] = useState("");

  // UI status states
  const [notification, setNotification] = useState(null);
  const [testRoast, setTestRoast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Roasts and Settings
  const fetchData = async () => {
    try {
      const settingsRes = await apiFetch("/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      setRoastSoundUrl(settingsData.customRoastSound || "");
      setSuccessSoundUrl(settingsData.customSuccessSound || "");
      setSupportiveSoundUrl(settingsData.customSupportiveSound || "");
      setAlarmSoundUrl(settingsData.customAlarmSound || "");

      const roastsRes = await apiFetch("/roasts");
      const roastsData = await roastsRes.json();
      setRoasts(roastsData);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateSettings = async (updatedSettings) => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/settings", {
        method: "POST",
        body: updatedSettings
      });
      const data = await res.json();
      setSettings(data);
      playSuccessSound(data.customSuccessSound);
    } catch (err) {
      console.error(err);
      playWarningSound();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAudioFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an audio file smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target.result);
      showNotification(`Loaded audio: ${file.name}`);
    };
    reader.onerror = (err) => {
      console.error("Error reading audio file:", err);
      alert("Failed to read the audio file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSounds = async (e) => {
    e.preventDefault();
    await handleUpdateSettings({
      ...settings,
      customRoastSound: roastSoundUrl,
      customSuccessSound: successSoundUrl,
      customSupportiveSound: supportiveSoundUrl,
      customAlarmSound: alarmSoundUrl
    });
    showNotification("Custom notification sounds saved!");
  };

  const handleToggleCategory = (catName) => {
    let newCats = [...settings.categories];
    if (newCats.includes(catName)) {
      newCats = newCats.filter(c => c !== catName);
    } else {
      newCats.push(catName);
    }
    handleUpdateSettings({ ...settings, categories: newCats });
  };

  const handleSpiceChange = (level) => {
    handleUpdateSettings({ ...settings, spiceLevel: level });
  };

  const handleAddRoast = async (e) => {
    e.preventDefault();
    if (!newRoastText.trim()) return;

    try {
      const res = await apiFetch("/roasts", {
        method: "POST",
        body: {
          text: newRoastText,
          category: newRoastCategory,
          severity: newRoastSeverity
        }
      });
      const added = await res.json();
      setRoasts([...roasts, added]);
      setNewRoastText("");
      showNotification("Custom roast added successfully!");
      playSuccessSound();
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const handleDeleteRoast = async (id) => {
    try {
      await apiFetch(`/roasts/${id}`, { method: "DELETE" });
      setRoasts(roasts.filter(r => r._id !== id));
      showNotification("Roast deleted.");
      playSuccessSound();
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const startEdit = (roast) => {
    setEditingRoastId(roast._id);
    setEditText(roast.text);
    setEditCategory(roast.category);
    setEditSeverity(roast.severity);
  };

  const cancelEdit = () => {
    setEditingRoastId(null);
  };

  const handleUpdateRoast = async (id) => {
    if (!editText.trim()) return;

    try {
      const res = await apiFetch(`/roasts/${id}`, {
        method: "PUT",
        body: {
          text: editText,
          category: editCategory,
          severity: editSeverity
        }
      });
      const updated = await res.json();
      setRoasts(roasts.map(r => r._id === id ? updated : r));
      setEditingRoastId(null);
      showNotification("Roast updated successfully!");
      playSuccessSound();
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Are you sure you want to reset all roasts to default presets?")) return;
    try {
      const res = await apiFetch("/roasts/reset", { method: "POST" });
      const data = await res.json();
      setRoasts(data.data);
      showNotification("Roasts reset to default presets.");
      playSuccessSound();
    } catch (err) {
      console.error(err);
      playWarningSound();
    }
  };

  const handleTestRoast = () => {
    let pool = roasts.filter(r => {
      const allowedCat = settings.categories.includes(r.category);
      let allowedSev = false;
      if (settings.spiceLevel === "Mild") allowedSev = r.severity === "Mild";
      else if (settings.spiceLevel === "Spicy") allowedSev = r.severity === "Mild" || r.severity === "Spicy";
      else if (settings.spiceLevel === "Toxic") allowedSev = true;
      return allowedCat && allowedSev;
    });

    if (pool.length === 0) {
      setTestRoast("No roasts match your active filters. Check your filters!");
      playWarningSound();
      return;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    setTestRoast(`[${random.severity}] [${random.category}] "${random.text}"`);
    playRoastSound();

    if (random.severity === "Toxic") {
      confetti({ particleCount: 30, colors: ["#ef4444"], spread: 45 });
    } else {
      confetti({ particleCount: 15, colors: ["#0d9488"], spread: 30 });
    }

    setTimeout(() => setTestRoast(null), 5000);
  };

  const customRoasts = roasts.filter(r => r.isCustom);
  const presetRoasts = roasts.filter(r => !r.isCustom);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-teal-400" />
            Roast Rules & Distraction Manager
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Customize the severity, joke collection, and audio alerts ZenSprint uses when you get distracted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleTestRoast}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-3 text-xs font-bold text-white shadow-lg transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Test Active Setup
          </button>
          <button 
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Presets
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-950 border border-teal-500/40 px-5 py-3 text-xs font-bold text-teal-300 shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          {notification}
        </div>
      )}

      {testRoast && (
        <div className="mt-6 rounded-2xl border border-teal-500/40 bg-teal-950/30 p-4 text-center text-teal-200 text-xs font-medium animate-pulse">
          🎯 Test roast fired: <span className="italic font-bold">{testRoast}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        
        {/* Left Side: General Roast Rules */}
        <div className="flex flex-col gap-6">
          
          {/* Roast Severity Selection */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-lg font-black text-white">Roast Severity Levels</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select the intensity of sarcastic reminders</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {["Mild", "Spicy", "Toxic"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSpiceChange(level)}
                  className={`flex flex-col items-center justify-center rounded-2xl p-4 border text-center transition cursor-pointer ${
                    settings.spiceLevel === level
                      ? level === "Mild"
                        ? "border-teal-500 bg-teal-950/30 text-teal-300"
                        : level === "Spicy"
                        ? "border-amber-500 bg-amber-950/30 text-amber-300"
                        : "border-red-500 bg-red-950/30 text-red-300"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Flame className={`h-6 w-6 mb-2 ${
                    settings.spiceLevel === level
                      ? level === "Mild" ? "text-teal-400" : level === "Spicy" ? "text-amber-400" : "text-red-400"
                      : "text-slate-600"
                  }`} />
                  <span className="text-xs font-black uppercase tracking-wider">{level}</span>
                  <span className="mt-1 text-[9px] opacity-75 leading-tight">
                    {level === "Mild" ? "Sarcastic advice" : level === "Spicy" ? "Direct roasts" : "Soul crushing"}
                  </span>
                </button>
              ))}
            </div>

            {settings.spiceLevel === "Toxic" && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-950/30 border border-red-900/40 p-3 text-red-300 text-xs">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <p><strong>Warning:</strong> Toxic mode contains funny, high-potency roasts. Don't take them personally!</p>
              </div>
            )}
          </div>

          {/* Active Categories Toggles */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-lg font-black text-white">Active Message Categories</h3>
            <p className="text-xs text-slate-400 mt-0.5">Toggle which categories of humor you want active</p>

            <div className="mt-4 space-y-2.5">
              {["Rude", "Funny", "Satirical", "Custom"].map((cat) => {
                const isActive = settings.categories.includes(cat);
                return (
                  <label 
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      isActive 
                        ? "border-teal-500/60 bg-teal-950/20 text-teal-300 font-bold" 
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold">{cat}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {cat === "Rude" && "Tough-love, direct focus reminders."}
                        {cat === "Funny" && "Lighthearted, humorous observations."}
                        {cat === "Satirical" && "Philosophical, sarcastic logic."}
                        {cat === "Custom" && "Your own created inside jokes."}
                      </p>
                    </div>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition ${
                      isActive ? "bg-teal-600 border-teal-500 text-white" : "border-slate-800 bg-slate-900"
                    }`}>
                      {isActive && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sound Preset Config */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-teal-400" /> Sound Alert Settings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Select high-quality synthesized sound tones or custom audio</p>

            <form onSubmit={handleSaveSounds} className="mt-4 space-y-4">
              {/* Distraction Roast Sound */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Distraction / Roast Sound</label>
                  <button 
                    type="button" 
                    onClick={() => playRoastSound(roastSoundUrl)}
                    className="text-teal-400 hover:text-teal-300 text-xs font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Test Sound
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={isPreset(roastSoundUrl) ? roastSoundUrl : roastSoundUrl === "" ? "synth_default" : "custom_url"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "synth_default") setRoastSoundUrl("");
                      else if (val === "custom_url") setRoastSoundUrl("https://");
                      else setRoastSoundUrl(val);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="synth_default">Synthesized Default Buzzer 🔊</option>
                    <option value="Retro Beep">Preset: Retro Beep 🕹️</option>
                    <option value="Zen Bell">Preset: Zen Bell 🔔</option>
                    <option value="System Alarm">Preset: System Alarm 🚨</option>
                    <option value="Brass Horn">Preset: Brass Horn 🎺</option>
                    <option value="custom_url">Custom Audio File or URL 📁</option>
                  </select>

                  {!isPreset(roastSoundUrl) && roastSoundUrl !== "" && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <input
                        type="text"
                        value={roastSoundUrl.startsWith("data:") ? "Local File Loaded 🎵" : roastSoundUrl}
                        onChange={(e) => setRoastSoundUrl(e.target.value)}
                        placeholder="https://... or upload local file"
                        className="flex-1 min-w-[180px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                        disabled={roastSoundUrl.startsWith("data:")}
                      />
                      {roastSoundUrl.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() => setRoastSoundUrl("")}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-2.5 py-2 text-[10px] font-bold text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <label className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 px-3 py-2 cursor-pointer shrink-0">
                        📁 Browse File...
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileChange(e, setRoastSoundUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Success Sound */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Goal Success Sound</label>
                  <button 
                    type="button" 
                    onClick={() => playSuccessSound(successSoundUrl)}
                    className="text-teal-400 hover:text-teal-300 text-xs font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Test Sound
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={isPreset(successSoundUrl) ? successSoundUrl : successSoundUrl === "" ? "synth_default" : "custom_url"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "synth_default") setSuccessSoundUrl("");
                      else if (val === "custom_url") setSuccessSoundUrl("https://");
                      else setSuccessSoundUrl(val);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="synth_default">Synthesized Default Arpeggio 🔊</option>
                    <option value="Retro Beep">Preset: Retro Beep 🕹️</option>
                    <option value="Zen Bell">Preset: Zen Bell 🔔</option>
                    <option value="System Alarm">Preset: System Alarm 🚨</option>
                    <option value="Brass Horn">Preset: Brass Horn 🎺</option>
                    <option value="custom_url">Custom Audio File or URL 📁</option>
                  </select>

                  {!isPreset(successSoundUrl) && successSoundUrl !== "" && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <input
                        type="text"
                        value={successSoundUrl.startsWith("data:") ? "Local File Loaded 🎵" : successSoundUrl}
                        onChange={(e) => setSuccessSoundUrl(e.target.value)}
                        placeholder="https://... or upload local file"
                        className="flex-1 min-w-[180px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                        disabled={successSoundUrl.startsWith("data:")}
                      />
                      {successSoundUrl.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() => setSuccessSoundUrl("")}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-2.5 py-2 text-[10px] font-bold text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <label className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 px-3 py-2 cursor-pointer shrink-0">
                        📁 Browse File...
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileChange(e, setSuccessSoundUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Supportive Sound */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Supportive Motivation Sound</label>
                  <button 
                    type="button" 
                    onClick={() => playSupportiveSound(supportiveSoundUrl)}
                    className="text-teal-400 hover:text-teal-300 text-xs font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Test Sound
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={isPreset(supportiveSoundUrl) ? supportiveSoundUrl : supportiveSoundUrl === "" ? "synth_default" : "custom_url"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "synth_default") setSupportiveSoundUrl("");
                      else if (val === "custom_url") setSupportiveSoundUrl("https://");
                      else setSupportiveSoundUrl(val);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="synth_default">Synthesized Warm Chord 🔊</option>
                    <option value="Retro Beep">Preset: Retro Beep 🕹️</option>
                    <option value="Zen Bell">Preset: Zen Bell 🔔</option>
                    <option value="System Alarm">Preset: System Alarm 🚨</option>
                    <option value="Brass Horn">Preset: Brass Horn 🎺</option>
                    <option value="custom_url">Custom Audio File or URL 📁</option>
                  </select>

                  {!isPreset(supportiveSoundUrl) && supportiveSoundUrl !== "" && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <input
                        type="text"
                        value={supportiveSoundUrl.startsWith("data:") ? "Local File Loaded 🎵" : supportiveSoundUrl}
                        onChange={(e) => setSupportiveSoundUrl(e.target.value)}
                        placeholder="https://... or upload local file"
                        className="flex-1 min-w-[180px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                        disabled={supportiveSoundUrl.startsWith("data:")}
                      />
                      {supportiveSoundUrl.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() => setSupportiveSoundUrl("")}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-2.5 py-2 text-[10px] font-bold text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <label className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 px-3 py-2 cursor-pointer shrink-0">
                        📁 Browse File...
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileChange(e, setSupportiveSoundUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Switch Alarm Sound */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Tab Switch Alarm Sound 🚨</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      startContinuousAlarm(alarmSoundUrl);
                      setTimeout(() => stopContinuousAlarm(), 2000);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Test 2s
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={isPreset(alarmSoundUrl) ? alarmSoundUrl : alarmSoundUrl === "" ? "synth_default" : "custom_url"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "synth_default") setAlarmSoundUrl("");
                      else if (val === "custom_url") setAlarmSoundUrl("https://");
                      else setAlarmSoundUrl(val);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="synth_default">Default Oscillator Siren (works in background) 🔊</option>
                    <option value="Retro Beep">Preset: Retro Beep 🕹️</option>
                    <option value="Zen Bell">Preset: Zen Bell 🔔</option>
                    <option value="System Alarm">Preset: System Alarm 🚨</option>
                    <option value="Brass Horn">Preset: Brass Horn 🎺</option>
                    <option value="custom_url">Custom Audio File or URL 📁</option>
                  </select>

                  {!isPreset(alarmSoundUrl) && alarmSoundUrl !== "" && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <input
                        type="text"
                        value={alarmSoundUrl.startsWith("data:") ? "Local File Loaded 🎵" : alarmSoundUrl}
                        onChange={(e) => setAlarmSoundUrl(e.target.value)}
                        placeholder="https://... or upload local file"
                        className="flex-1 min-w-[180px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                        disabled={alarmSoundUrl.startsWith("data:")}
                      />
                      {alarmSoundUrl.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() => setAlarmSoundUrl("")}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-2.5 py-2 text-[10px] font-bold text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <label className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 px-3 py-2 cursor-pointer shrink-0">
                        📁 Browse File...
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileChange(e, setAlarmSoundUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5">💡 The default oscillator siren always plays in the background. Custom sounds play alongside it when possible.</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-md"
              >
                Save Sound Config
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Custom Jokes & Presets Collection */}
        <div className="flex flex-col gap-6">
          
          {/* Create Custom Roast Card */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-lg font-black text-white">Create Custom Joke</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add your own personalized sarcastic triggers</p>

            <form onSubmit={handleAddRoast} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Roast Text</label>
                <textarea 
                  value={newRoastText}
                  onChange={(e) => setNewRoastText(e.target.value)}
                  placeholder="e.g. Stop scrolling. Your future self is judging you right now."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                  <select 
                    value={newRoastCategory}
                    onChange={(e) => setNewRoastCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Custom">Custom</option>
                    <option value="Rude">Rude</option>
                    <option value="Funny">Funny</option>
                    <option value="Satirical">Satirical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Severity</label>
                  <select 
                    value={newRoastSeverity}
                    onChange={(e) => setNewRoastSeverity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Toxic">Toxic</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Custom Roast
              </button>
            </form>
          </div>

          {/* Custom Roasts List */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-base font-black text-white">Your Custom Roasts ({customRoasts.length})</h3>

            <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {customRoasts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No custom roasts added yet. Create one above!
                </div>
              ) : (
                customRoasts.map((r) => (
                  <div key={r._id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5">
                    {editingRoastId === r._id ? (
                      <div className="space-y-2.5">
                        <textarea 
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateRoast(r._id)}
                            className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-bold text-white"
                          >
                            Save
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-200">"{r.text}"</p>
                          <div className="mt-2 flex gap-1.5">
                            <span className="rounded-md bg-teal-950 border border-teal-800 px-2 py-0.5 text-[9px] font-black text-teal-400">
                              {r.category}
                            </span>
                            <span className="rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-black text-slate-400">
                              {r.severity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => startEdit(r)}
                            className="p-1.5 text-slate-500 hover:text-teal-400 transition bg-transparent border-0 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRoast(r._id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preset Roasts List */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-800/80">
            <h3 className="text-base font-black text-white">Preset Built-In Roasts ({presetRoasts.length})</h3>

            <div className="mt-4 space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {presetRoasts.map((r) => (
                <div key={r._id} className="rounded-xl border border-slate-900 bg-slate-900/20 p-3">
                  <p className="text-xs font-medium text-slate-400">"{r.text}"</p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                      {r.category}
                    </span>
                    <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                      {r.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
