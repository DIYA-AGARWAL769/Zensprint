import { useState } from "react";
import { ShieldAlert, Palette, Gift, Plus, Trash2, Check, Coins, Sparkles } from "lucide-react";

const THEMES = [
  { id: "default", name: "Zen Teal 🪷", desc: "Original sleek dark teal design system", previewColor: "#0d9488", cost: 0 },
  { id: "theme-matrix", name: "Matrix Hacker 🟩", desc: "Deep cyberpunk dark green glow", previewColor: "#16a34a", cost: 150 },
  { id: "theme-sunset", name: "Sunset Blaze 🌅", desc: "Warm fiery orange and rose glow", previewColor: "#ea580c", cost: 150 },
  { id: "theme-cyberpunk", name: "Neon Cyberpunk 🌆", desc: "Vibrant fuchsia and cyan neon glow", previewColor: "#c026d3", cost: 200 },
  { id: "theme-forest", name: "Emerald Forest 🌲", desc: "Calming deep emerald nature vibe", previewColor: "#059669", cost: 150 }
];

export default function ZenShop({
  settings,
  handleBuyItem,
  handleEquipTheme,
  handleAddCustomReward,
  handleDeleteCustomReward,
  handleRedeemReward,
  rewardFormTitle,
  setRewardFormTitle,
  rewardFormCost,
  setRewardFormCost
}) {
  const [activeShopTab, setActiveShopTab] = useState("shields");
  const coins = settings?.zenCoins || 0;
  const activeShields = settings?.excuseShields || 0;
  const unlockedThemes = settings?.unlockedThemes || ["default"];
  const currentTheme = settings?.equippedTheme || "default";
  const customRewards = settings?.customRewards || [];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800/80">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-teal-400" />
            Zen Shop & Gamification Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Redeem your hard-earned ZenCoins for Excuse Shields, Visual Themes, and Custom Rewards!
          </p>
        </div>

        {/* Coins Badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-amber-950/40 border border-amber-500/30 px-4 py-2 text-sm font-black text-amber-300 shrink-0">
          <Coins className="h-5 w-5 text-amber-400 animate-pulse" />
          <span>{coins} ZenCoins 🪙</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveShopTab("shields")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeShopTab === "shields"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> Excuse Shields 🛡️
        </button>

        <button
          onClick={() => setActiveShopTab("themes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeShopTab === "themes"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Palette className="h-4 w-4" /> Visual Themes 🎨
        </button>

        <button
          onClick={() => setActiveShopTab("custom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeShopTab === "custom"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Gift className="h-4 w-4" /> Custom Rewards 🎁
        </button>
      </div>

      {/* TAB 1: EXCUSE SHIELDS */}
      {activeShopTab === "shields" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Excuse Shield 🛡️</h4>
                  <p className="text-xs text-slate-400">100 ZenCoins</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Automatically absorbs 1 accidental distraction or tab switch incident without assigning a shame chore or penalizing your streak.
              </p>

              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-400">
                  Current Shields: <strong className="text-teal-300">{activeShields}</strong>
                </span>

                <button
                  onClick={() => handleBuyItem("shield")}
                  disabled={coins < 100}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  {coins < 100 ? "Need 100 🪙" : "Buy Shield (100 🪙)"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-6 text-xs text-slate-400 space-y-3">
              <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-400" /> How Shields Work
              </h5>
              <p>• Earn ZenCoins by completing Pomodoro focus sprints (+15 🪙 per session).</p>
              <p>• Keep shields equipped in inventory. When a blocked site or tab switch occurs during a sprint, 1 shield is consumed instantly to safeguard your streak.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL THEMES */}
      {activeShopTab === "themes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const isEquipped = currentTheme === theme.id;

            return (
              <div
                key={theme.id}
                className={`rounded-2xl p-5 border transition flex flex-col justify-between ${
                  isEquipped
                    ? "bg-teal-950/30 border-teal-500/60 shadow-lg shadow-teal-500/10"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.previewColor }}
                      />
                      <h4 className="text-sm font-black text-white">{theme.name}</h4>
                    </div>

                    {isEquipped && (
                      <span className="rounded-md bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[9px] font-black text-teal-300">
                        EQUIPPED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{theme.desc}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {theme.cost === 0 ? "Free" : `${theme.cost} 🪙`}
                  </span>

                  {isEquipped ? (
                    <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Active
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipTheme(theme.id)}
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyItem("theme", theme.id)}
                      disabled={coins < theme.cost}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: CUSTOM REWARDS */}
      {activeShopTab === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6">
          
          {/* Create Reward Form */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40">
            <h4 className="text-sm font-black text-white mb-1">Add Personal Reward</h4>
            <p className="text-xs text-slate-400 mb-4">Set real-life treats you can purchase with ZenCoins</p>

            <form onSubmit={handleAddCustomReward} className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Reward Title</label>
                <input
                  type="text"
                  value={rewardFormTitle}
                  onChange={(e) => setRewardFormTitle(e.target.value)}
                  placeholder="e.g. 1 Episode of Anime 📺"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">ZenCoins Cost</label>
                <input
                  type="number"
                  value={rewardFormCost}
                  onChange={(e) => setRewardFormCost(e.target.value)}
                  min="10"
                  max="1000"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Create Reward
              </button>
            </form>
          </div>

          {/* Custom Rewards List */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white">Your Created Rewards</h4>

            {customRewards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                No custom rewards created yet. Add one on the left to motivate yourself!
              </div>
            ) : (
              customRewards.map((reward) => (
                <div
                  key={reward._id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/40 p-4 border border-slate-800"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">{reward.title}</h5>
                    <span className="text-xs font-bold text-amber-300 font-mono">{reward.cost} 🪙</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={coins < reward.cost}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Redeem 🎉
                    </button>

                    <button
                      onClick={() => handleDeleteCustomReward(reward._id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
