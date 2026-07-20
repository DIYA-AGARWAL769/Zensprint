import { Sparkles, X, Calendar } from "lucide-react";

export default function SupportiveBanner({ quote, pastGoals, onClose }) {
  if (!pastGoals || pastGoals.length === 0) return null;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5 border border-teal-500/30 bg-teal-950/20 text-teal-200 mb-6 shadow-lg animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-teal-500/20 p-2 text-teal-400 shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-400">
                Fresh Start Motivation ✨
              </span>
              <span className="rounded-md bg-teal-900/40 border border-teal-700/40 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                {pastGoals.length} Unfinished Yesterday
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium leading-relaxed italic text-teal-100">
              "{quote}"
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-teal-400 hover:bg-teal-900/40 hover:text-white transition bg-transparent border-0 cursor-pointer shrink-0"
          title="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
