import { useState, useEffect } from "react";
import { Flame, ShieldAlert, X, Send, Clock, Globe, CheckCircle2 } from "lucide-react";

export default function RoastModal({
  activeRoast,
  onClose,
  onCompleteChore,
  explanationText,
  setExplanationText,
  handleSubmitExplanation,
  excuseDuration,
  setExcuseDuration,
  selectedSiteToUnblock,
  setSelectedSiteToUnblock,
  blockedDomains
}) {
  const [choreSecondsLeft, setChoreSecondsLeft] = useState(120);

  useEffect(() => {
    if (!activeRoast || !activeRoast.chore) return;
    setChoreSecondsLeft(120);
    const timer = setInterval(() => {
      setChoreSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeRoast]);

  if (!activeRoast) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isLocked = !activeRoast.isShielded && activeRoast.chore;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      
      <div className="glass-modal relative w-full max-w-lg overflow-hidden rounded-3xl p-6 md:p-8 text-left border border-slate-700/80 shadow-2xl">
        
        {/* Background Ambient Glow */}
        <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl pointer-events-none ${
          activeRoast.isShielded ? "bg-teal-500/20" : "bg-red-500/20"
        }`} />

        {/* Close Button (Always visible now) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 hover:bg-slate-800 transition bg-transparent border-0 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl ${
            activeRoast.isShielded ? "bg-teal-500/20 text-teal-400" : "bg-red-500/20 text-red-400"
          }`}>
            {activeRoast.isShielded ? <ShieldAlert className="h-7 w-7" /> : <Flame className="h-7 w-7" />}
          </div>

          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
              activeRoast.isShielded 
                ? "bg-teal-950 border border-teal-700 text-teal-300"
                : "bg-red-950 border border-red-800 text-red-400"
            }`}>
              {activeRoast.isShielded ? "Excuse Shield Active" : `${activeRoast.severity || "Spicy"} Roast Alert`}
            </span>
            <h3 className="text-lg font-black text-white mt-1">
              {activeRoast.prefix || "Distraction Detected!"}
            </h3>
          </div>
        </div>

        {/* Roast Insult Bubble */}
        <div className={`rounded-2xl p-4 border my-4 font-medium text-sm leading-relaxed ${
          activeRoast.isShielded 
            ? "bg-teal-950/30 border-teal-500/40 text-teal-100"
            : "bg-red-950/30 border-red-500/40 text-red-100"
        }`}>
          "{activeRoast.text}"
        </div>

        {/* Shielded Case: Simple Acknowledge Button */}
        {activeRoast.isShielded ? (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-3 text-xs font-bold text-white transition cursor-pointer shadow-lg"
            >
              Phew, Thanks Shield! 👍
            </button>
          </div>
        ) : (
          /* Unshielded Case: Excuse Justification Form or Quick Dismiss */
          <div className="mt-5 border-t border-slate-800/80 pt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Submit Excuse / Justification</span>
                <span className="text-[10px] text-slate-500">Optional</span>
              </label>
              <textarea
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder="e.g. Needed to research API documentation for work project..."
                rows={2}
                className="mt-1.5 w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            {/* Optional Excuse Timeout Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3 text-teal-400" /> Temporary Break Time
                </label>
                <div className="mt-1 space-y-1.5">
                  <select
                    value={excuseDuration}
                    onChange={(e) => setExcuseDuration(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value={0}>No Temporary Break</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour (60 Mins - e.g. Study Video)</option>
                    <option value={90}>1.5 Hours (90 Mins)</option>
                    <option value={120}>2 Hours (120 Mins)</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={480}
                      placeholder="Custom Mins (e.g. 60)..."
                      value={excuseDuration > 0 ? excuseDuration : ""}
                      onChange={(e) => setExcuseDuration(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Globe className="h-3 w-3 text-teal-400" /> Site to Unblock
                </label>
                <select
                  value={selectedSiteToUnblock}
                  onChange={(e) => setSelectedSiteToUnblock(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">All Distraction Blockers</option>
                  {blockedDomains?.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                Dismiss & Close
              </button>

              <button
                type="button"
                onClick={handleSubmitExplanation}
                disabled={!explanationText.trim() && excuseDuration <= 0}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> {excuseDuration > 0 ? "Start Break & Unlock" : "Submit Excuse & Unlock"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
