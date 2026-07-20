import { Trophy, Flame, Coins, ShieldAlert } from "lucide-react";

export default function LevelHeader({ levelInfo, zenXP, coins, streak, activeShields, theme }) {
  const { levelNum, levelName, progressPercent, minXp, maxXp } = levelInfo;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6 shadow-xl border border-slate-800/80 mb-6">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
        
        {/* Left Side: Level Name & XP Bar */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-black shadow-lg shadow-teal-500/20">
              L{levelNum}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">{levelName}</h2>
                <span className="rounded-md bg-teal-950/60 border border-teal-800/50 px-2 py-0.5 text-[10px] font-black uppercase text-teal-400">
                  Level {levelNum}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <strong className="text-teal-300 font-mono">{zenXP} XP</strong> total {maxXp !== Infinity ? `(${maxXp - zenXP} XP to next rank)` : "(Max Rank Reached!)"}
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5 font-mono">
              <span>{minXp} XP</span>
              <span className="text-teal-400">{progressPercent}%</span>
              <span>{maxXp === Infinity ? "MAX" : `${maxXp} XP`}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/60">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-all duration-500 shadow-sm shadow-teal-500/50"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Currency Badges */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* ZenCoins */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-950/30 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-sm">
            <Coins className="h-4 w-4 text-amber-400 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-amber-400/80 font-black">ZenCoins</span>
              <span className="text-sm font-black text-amber-200 font-mono">{coins || 0} 🪙</span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 rounded-xl bg-orange-950/30 border border-orange-500/30 px-3.5 py-2 text-xs font-bold text-orange-300 shadow-sm">
            <Flame className="h-4 w-4 text-orange-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-orange-400/80 font-black">Streak</span>
              <span className="text-sm font-black text-orange-200 font-mono">{streak || 0} Days 🔥</span>
            </div>
          </div>

          {/* Excuse Shield */}
          <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm border ${
            (activeShields || 0) > 0 
              ? "bg-teal-950/40 border-teal-500/40 text-teal-300" 
              : "bg-slate-900/60 border-slate-800 text-slate-500"
          }`}>
            <ShieldAlert className={`h-4 w-4 ${ (activeShields || 0) > 0 ? "text-teal-400" : "text-slate-600"}`} />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-80 font-black">Shields</span>
              <span className="text-sm font-black font-mono">
                {(activeShields || 0) > 0 ? `${activeShields} Active 🛡️` : "None ❌"}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
