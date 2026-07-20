import { Play, Pause, RotateCcw, Target, ShieldAlert, Coffee } from "lucide-react";
import { unlockAudio } from "../../utils/audio";

export default function TimerCard({
  timeLeft,
  timerLimit,
  timerRunning,
  toggleTimer,
  resetTimer,
  focusedGoal,
  setFocusedGoal,
  setTimeLeft,
  setTimerLimit,
  triggerManualRoast,
  excusedTimeLeft,
  excusedReason,
  unblockedSite,
  handleResumeStrictFocus
}) {
  const formatTime = (seconds) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${h}h ${m}m ${s}s`;
    }
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // SVG ring stroke offset calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timerLimit > 0 ? timeLeft / timerLimit : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleSelectPreset = (minutes) => {
    if (timerRunning) return;
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setTimerLimit(seconds);
  };

  return (
    <div className="glass-card glass-card-hover relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800/80 text-center flex flex-col items-center">
      
      {/* Background Decorative Radial Ambient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${timerRunning ? 'from-teal-500/10 via-transparent to-transparent' : 'from-slate-800/5 via-transparent to-transparent'} pointer-events-none transition-colors duration-500`} />

      {/* Header Tag */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase border ${
          timerRunning 
            ? "bg-teal-950/60 border-teal-500/40 text-teal-300 animate-pulse" 
            : "bg-slate-900 border-slate-800 text-slate-400"
        }`}>
          <span className={`h-2 w-2 rounded-full ${timerRunning ? "bg-teal-400 animate-ping" : "bg-slate-500"}`} />
          {timerRunning ? "Focus Sprint Active" : "Timer Ready"}
        </span>
      </div>

      {/* Focused Target Goal Pill */}
      {focusedGoal ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-teal-950/40 border border-teal-500/30 px-4 py-2 text-xs font-bold text-teal-200 animate-in fade-in">
          <Target className="h-4 w-4 text-teal-400 shrink-0" />
          <span className="truncate max-w-[240px]">Target: {focusedGoal.title}</span>
          <button 
            type="button"
            onClick={() => {
              setFocusedGoal(null);
              resetTimer();
            }}
            className="ml-1 text-teal-400 hover:text-white bg-transparent border-0 cursor-pointer text-sm font-black"
            title="Unpin goal"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="mb-6 text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <Target className="h-3.5 w-3.5 text-slate-500" />
          <span>General Focus Session (or pick a task below)</span>
        </div>
      )}

      {/* Excused Break Active Banner */}
      {excusedTimeLeft > 0 && (
        <div className="mb-6 w-full rounded-2xl bg-amber-950/30 border border-amber-500/30 p-3.5 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <Coffee className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-300">
                Excused Break: <span className="font-mono text-amber-100">{formatTime(excusedTimeLeft)}</span> remaining
              </p>
              {unblockedSite && <p className="text-[10px] text-amber-400/80">Unblocked: {unblockedSite}</p>}
            </div>
          </div>
          <button
            onClick={handleResumeStrictFocus}
            className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 transition cursor-pointer shrink-0"
          >
            Resume Focus
          </button>
        </div>
      )}

      {/* Animated SVG Circular Progress Ring */}
      <div className="relative my-2 flex items-center justify-center">
        <svg className="w-56 h-56 md:w-64 md:h-64" viewBox="0 0 200 200">
          {/* Background Track Circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-slate-900"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated Progress Stroke */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="timer-ring-circle transition-all duration-700"
            stroke={timerRunning ? "url(#timerGradient)" : "#0d9488"}
            strokeWidth="12"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          {/* SVG Gradient Def */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Big Time Display inside SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white select-none">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
            {timerRunning ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[15, 25, 45, 60].map((mins) => (
          <button
            key={mins}
            type="button"
            disabled={timerRunning}
            onClick={() => handleSelectPreset(mins)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              Math.round(timerLimit / 60) === mins && !timerRunning
                ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Main Timer Action Buttons */}
      <div className="mt-6 flex items-center justify-center gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            toggleTimer();
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-black text-white shadow-lg transition-all cursor-pointer ${
            timerRunning
              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"
          }`}
        >
          {timerRunning ? (
            <>
              <Pause className="h-4 w-4 fill-white" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" /> Start Sprint
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 text-slate-400 hover:text-white transition cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Self-Report Distraction Button */}
      <button
        type="button"
        onClick={() => triggerManualRoast("distraction")}
        className="mt-4 text-xs font-bold text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer flex items-center gap-1 opacity-80 hover:opacity-100 transition"
      >
        <span>Self-Report Distraction 🤡</span>
      </button>

    </div>
  );
}
