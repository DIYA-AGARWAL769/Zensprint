import { useState } from "react";
import { ShieldCheck, Coffee, Sparkles, ArrowRight, Lock, Target, Clock, X, Check } from "lucide-react";

export default function StrictFocusPanel({
  excusedTimeLeft,
  excusedReason,
  unblockedSite,
  handleResumeStrictFocus,
  onStartExcusedBreak,
  timerRunning,
  focusedGoal
}) {
  const [showModal, setShowModal] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [durationInput, setDurationInput] = useState(60); // Default to 1 hour (60 mins)
  const [customMins, setCustomMins] = useState("");

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

  const handleStartBreakSubmit = (e) => {
    e.preventDefault();
    const parsedCustom = customMins.trim() ? parseInt(customMins.trim(), 10) : NaN;
    const finalDuration = (!isNaN(parsedCustom) && parsedCustom > 0) ? parsedCustom : durationInput;
    const finalReason = reasonInput.trim() || "Study Video / Authorized Break";
    
    if (onStartExcusedBreak) {
      onStartExcusedBreak(finalDuration, finalReason);
    }
    setShowModal(false);
    setCustomMins("");
  };

  return (
    <div className="w-full mb-8">
      {excusedTimeLeft > 0 ? (
        /* Excused Break Active State Panel */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border border-amber-500/40 p-6 md:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-inner">
                <Coffee className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
                    ☕ Excused Break Active
                  </span>
                  {unblockedSite && (
                    <span className="text-xs text-amber-400 font-medium">
                      (Unblocked: {unblockedSite})
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-white mt-1">
                  {excusedReason ? `Reason: "${excusedReason}"` : "Authorized Break Mode"}
                </h3>

                <p className="text-xs text-amber-200/80 mt-1 font-medium">
                  Tab-switch warnings and alarm beeps are paused. Take your time for study videos or work research.
                </p>
              </div>
            </div>

            {/* Countdown & Return Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-amber-500/20">
              <div className="text-center sm:text-right w-full sm:w-auto">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Time Remaining</span>
                <span className="text-2xl md:text-3xl font-black font-mono text-amber-100 drop-shadow-sm">
                  {formatTime(excusedTimeLeft)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResumeStrictFocus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-3.5 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>End Break & Resume Focus</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Strict Focus Active Panel with Excused Break Button */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-950 border border-teal-500/30 p-5 md:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${timerRunning ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-400'}`}>
                {timerRunning ? <ShieldCheck className="h-5 w-5 animate-pulse" /> : <Lock className="h-5 w-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    timerRunning ? "bg-teal-900/60 border border-teal-500/40 text-teal-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${timerRunning ? "bg-teal-400 animate-ping" : "bg-slate-500"}`} />
                    {timerRunning ? "Strict Focus Cop Engaged 🚨" : "Strict Focus Standby"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-semibold mt-1">
                  {focusedGoal ? (
                    <span className="flex items-center gap-1 text-teal-300">
                      <Target className="h-3.5 w-3.5 shrink-0" /> Target: {focusedGoal.title}
                    </span>
                  ) : (
                    "Tab switches trigger automatic alarms & shame chores unless break is authorized."
                  )}
                </p>
              </div>
            </div>

            {/* Direct Excused Break Button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-5 py-3 text-xs font-black text-amber-200 transition cursor-pointer hover:scale-102 shrink-0"
            >
              <Coffee className="h-4 w-4 text-amber-400" />
              <span>Take Excused Break / Watch Study Video</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Excused Break Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-7 text-white shadow-2xl text-left">
            
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer border-0"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Setup Excused Break</h3>
                <p className="text-xs text-slate-400 font-medium">Pause alarms for study videos, tutorials, or research</p>
              </div>
            </div>

            <form onSubmit={handleStartBreakSubmit} className="space-y-4">
              
              {/* Reason Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Reason / Activity Description</label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Watching 1-hour React & Node.js study video..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Preset Duration Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Break Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setDurationInput(mins);
                        setCustomMins("");
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        durationInput === mins && !customMins
                          ? "bg-amber-500/30 border-amber-500 text-amber-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60} Hour${mins > 60 ? 's' : ''}` : `${mins} Mins`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Minutes Entry */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Or Enter Custom Minutes:</label>
                <input
                  type="number"
                  min={1}
                  max={480}
                  placeholder="Enter custom minutes (e.g. 60)..."
                  value={customMins}
                  onChange={(e) => {
                    setCustomMins(e.target.value);
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Start Break ({customMins ? customMins : durationInput}m)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
