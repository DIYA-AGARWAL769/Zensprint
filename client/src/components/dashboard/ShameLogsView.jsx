import { Flame, ShieldAlert, AlertCircle, Trash2, PlusCircle } from "lucide-react";

export default function ShameLogsView({ shameLogs = [], onClearShameLogs, onTriggerRoast }) {
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your distraction history?")) {
      if (onClearShameLogs) onClearShameLogs();
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            Distraction Incident History (Shame Logs)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of focus interruptions, tab switches, and blocked sites recorded by ZenSprint.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {onTriggerRoast && (
            <button
              type="button"
              onClick={() => onTriggerRoast("distraction")}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-md shadow-red-900/30 border border-red-500/30"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Simulate Distraction 🚨
            </button>
          )}

          <span className="rounded-xl bg-red-950/40 border border-red-500/30 px-3.5 py-1.5 text-xs font-black text-red-400">
            {shameLogs.length} Total Incidents
          </span>

          {shameLogs.length > 0 && onClearShameLogs && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/30 hover:bg-red-900/60 text-red-400 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Wall
            </button>
          )}
        </div>
      </div>

      {shameLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-sm text-slate-500">
          🎉 Pure focus! No slacking incidents recorded. Click "Simulate Distraction 🚨" above to test logging.
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {shameLogs.map((log) => {
            const rawDate = log.timestamp || log.createdAt || log.date;
            const dateStr = rawDate ? new Date(rawDate).toLocaleString() : "Just now";
            const isShielded = log.isShielded || (log.siteBlocked && log.siteBlocked.includes("(Shielded"));

            return (
              <div
                key={log._id}
                className={`rounded-2xl p-4 border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isShielded
                    ? "bg-teal-950/20 border-teal-500/30 text-teal-200"
                    : "bg-slate-900/50 border-slate-800/80 text-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isShielded ? "bg-teal-500/20 text-teal-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {isShielded ? <ShieldAlert className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {log.siteBlocked || "Tab Switch"}
                      </span>
                      {isShielded ? (
                        <span className="rounded-md bg-teal-950 border border-teal-700 px-2 py-0.5 text-[9px] font-black text-teal-300">
                          🛡️ SHIELDED
                        </span>
                      ) : (
                        <span className="rounded-md bg-red-950 border border-red-800 px-2 py-0.5 text-[9px] font-black text-red-400">
                          🔥 PENALTY
                        </span>
                      )}
                    </div>

                    {log.roastText && (
                      <p className="text-xs text-slate-300 italic mt-1 font-medium">
                        "{log.roastText}"
                      </p>
                    )}

                    {log.explanation && (
                      <p className="text-[11px] text-amber-300/90 mt-1">
                        Justification: <span className="italic">"{log.explanation}"</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 shrink-0 self-end md:self-center">
                  {dateStr}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
