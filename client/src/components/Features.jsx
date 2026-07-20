import { LayoutDashboard, MessageSquareOff, Flame } from "lucide-react";

function Features({ onSelectFeature }) {
  return (
    <section
      id="features"
      className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 pb-20 pt-10 md:grid-cols-3 md:px-10"
    >
      <button 
        onClick={() => onSelectFeature("dashboard")}
        className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 shadow-sm hover:border-teal-500/30 hover:bg-zinc-900/30 transition-all duration-300 -translate-y-0 hover:-translate-y-1 text-left cursor-pointer focus:outline-hidden"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-400">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-black text-white">Interactive Goals</h2>
        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
          Organize and track your sprint checklist with automated progress calculation and rewarding celebrations upon completion.
        </p>
      </button>

      <button 
        onClick={() => onSelectFeature("settings")}
        className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 shadow-sm hover:border-purple-500/30 hover:bg-zinc-900/30 transition-all duration-300 -translate-y-0 hover:-translate-y-1 text-left cursor-pointer focus:outline-hidden"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-400">
          <MessageSquareOff className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-black text-white">Custom Roast Pool</h2>
        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
          Write your own customized jokes, edit default messages, and select which severity matches your focus requirements.
        </p>
      </button>

      <button 
        onClick={() => onSelectFeature("dashboard")}
        className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 shadow-sm hover:border-amber-500/30 hover:bg-zinc-900/30 transition-all duration-300 -translate-y-0 hover:-translate-y-1 text-left cursor-pointer focus:outline-hidden"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
          <Flame className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-black text-white">Focus Enforcement</h2>
        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
          Get instant sarcastic feedback when you pause the timer, report distractions, or lose track of your sprint time.
        </p>
      </button>
    </section>
  );
}

export default Features;
