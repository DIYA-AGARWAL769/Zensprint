import { useState, useEffect } from "react";
import { Flame, Play, Pause, Target, Sparkles, Trophy, ChevronRight, RotateCcw } from "lucide-react";
import Features from "./Features";

const MOCK_ROASTS = {
  Mild: [
    "Are you actually working or just breathing heavily near the keyboard?",
    "A distraction a day keeps the progress away. Literally.",
    "Your goals are currently crying in the corner. Go comfort them.",
    "Focus is hard. Scrolling social media is easy. Choose your hard."
  ],
  Spicy: [
    "Oh look, another tab opened. Is that for your career search, or are you just giving up?",
    "You are doing great! At getting absolutely nothing done.",
    "Go back to work before I start telling people what's on your search history.",
    "Rumor has it that every time you get distracted, a developer's coffee goes cold."
  ],
  Toxic: [
    "My grandma writes code faster than you, and she's been dead since 2012.",
    "You've been staring at this screen for 20 minutes. The code isn't going to write itself out of fear.",
    "That random YouTube video won't fix your lack of willpower. Back to work.",
    "Focus session complete. That was probably exhausting for your single brain cell."
  ]
};

function Hero({ onGetStarted, onSelectFeature }) {
  const [simTime, setSimTime] = useState(25 * 60);
  const [simTimerRunning, setSimTimerRunning] = useState(false);
  const [simSpiceLevel, setSimSpiceLevel] = useState("Spicy");
  const [simRoast, setSimRoast] = useState(
    "Oh look, another tab opened. Is that for your career search, or are you just giving up?"
  );

  // Simulated Timer tick
  useEffect(() => {
    let interval = null;
    if (simTimerRunning && simTime > 0) {
      interval = setInterval(() => {
        setSimTime((prev) => prev - 1);
      }, 1000);
    } else if (simTime === 0) {
      setSimTimerRunning(false);
      setSimTime(25 * 60);
      setSimRoast("Wow, you actually finished a mock session. Don't get used to it.");
    }
    return () => clearInterval(interval);
  }, [simTimerRunning, simTime]);

  const handleSimToggle = () => {
    setSimTimerRunning(!simTimerRunning);
  };

  const handleSimReset = () => {
    setSimTimerRunning(false);
    setSimTime(25 * 60);
  };

  const handleSimDistract = () => {
    setSimTimerRunning(false);
    const pool = MOCK_ROASTS[simSpiceLevel];
    const randomRoast = pool[Math.floor(Math.random() * pool.length)];
    setSimRoast(randomRoast);
  };

  const formatSimTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[45%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none"></div>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-10">
        
        {/* Left Side: Pitch */}
        <div className="hero-card-rise relative text-center md:text-left">

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <div className="inline-flex items-center gap-2 rounded-lg border border-teal-500/20 bg-teal-950/40 px-3.5 py-1.5 text-xs font-black text-teal-400 shadow-sm">
              <span className="status-dot h-2 w-2 rounded-full bg-teal-500"></span>
              Sarcastic Focus Buddy
            </div>
            <div className="focus-chip inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-950/40 px-3.5 py-1.5 text-xs font-black text-amber-400">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Spicy Mode Enabled
            </div>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl text-white">
            Stop distracting
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
              yourself. Or else.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:mx-0">
            ZenSprint is the only productivity tracker that keeps you focused through **hilarious, rude, and satirical roasts** whenever you slack off. Track your goals, set a timer, and customize the insults to match your humor level.
          </p>

          {/* Quick Live Preview Metric */}
          <div className="mt-8 rounded-xl border border-white/5 bg-zinc-950/50 p-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4.5 w-4.5 text-teal-400" />
                <p className="text-sm font-bold text-zinc-300">Sprint Goal Completion</p>
              </div>
              <span className="rounded-lg bg-teal-500/20 px-2.5 py-0.5 text-xs font-black text-teal-400 border border-teal-500/30">
                82% Done
              </span>
            </div>
            <div className="mt-3.5 h-2 overflow-hidden rounded-lg bg-zinc-900">
              <div className="progress-flow h-full w-[82%] rounded-lg bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600"></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <button 
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-teal-600/10 transition-all hover:-translate-y-0.5 hover:bg-teal-700 cursor-pointer"
            >
              Start Your Sprint
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a 
              href="#features" 
              className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-8 py-4 text-sm font-bold text-zinc-350 hover:border-zinc-700 hover:text-white"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-900 pt-6 text-left">
            <div>
              <p className="text-xl font-black text-white">25m</p>
              <p className="text-xs text-zinc-500">Focus Timers</p>
            </div>
            <div>
              <p className="text-xl font-black text-white">Custom</p>
              <p className="text-xs text-zinc-500">Roast Pool</p>
            </div>
            <div>
              <p className="text-xl font-black text-white">100%</p>
              <p className="text-xs text-zinc-500">Distraction Free</p>
            </div>
          </div>

          {/* Live Feed of Shame */}
          <div className="mt-8 border-t border-zinc-900 pt-6 text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Global Shame Feed (Live)
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time slacking incidents reported by focus cop extension</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs rounded-xl bg-zinc-950/40 p-3 border border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-600">3s ago</span>
                  <span className="font-bold text-zinc-300">LazyCoder_4</span>
                  <span className="text-zinc-500">blocked on</span>
                  <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">instagram.com</span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 italic">Tasked: 10 Jumping Jacks</span>
              </div>

              <div className="flex items-center justify-between text-xs rounded-xl bg-zinc-950/40 p-3 border border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-600">1m ago</span>
                  <span className="font-bold text-zinc-300">Procrastinator_X</span>
                  <span className="text-zinc-500">switched tabs</span>
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">Tab Switch</span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 italic">Insult: "Breathing near keyboard?"</span>
              </div>

              <div className="flex items-center justify-between text-xs rounded-xl bg-zinc-950/40 p-3 border border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-600">4m ago</span>
                  <span className="font-bold text-zinc-300">Netflipper</span>
                  <span className="text-zinc-500">blocked on</span>
                  <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">netflix.com</span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 italic">Tasked: Clean your desk</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Mock Interface Preview */}
        <div className="relative">
          
          {/* Main Simulated Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 p-5 shadow-2xl backdrop-blur-xl">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/70"></span>
                <span className="h-3 w-3 rounded-full bg-teal-500/70"></span>
              </div>
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Live Simulator</span>
            </div>

            {/* Spice Selector Pills */}
            <div className="flex justify-between items-center gap-2 mb-4 bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/60">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Roast Level:</span>
              <div className="flex gap-1.5">
                {["Mild", "Spicy", "Toxic"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSimSpiceLevel(level)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black transition cursor-pointer ${
                      simSpiceLevel === level
                        ? level === "Mild"
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : level === "Spicy"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-zinc-950 text-zinc-500 border border-transparent hover:text-zinc-350"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Focus Timer */}
            <div className="rounded-xl bg-zinc-900/40 p-4 border border-zinc-900 text-center relative overflow-hidden">
              <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full ${simTimerRunning ? 'bg-teal-950/60 border border-teal-900/30 text-teal-400 animate-pulse' : 'bg-zinc-950 border border-zinc-900 text-zinc-400'}`}>
                {simTimerRunning ? "FOCUS ACTIVE" : "TIMER READY"}
              </span>
              <p className="mt-2 text-4xl font-black tracking-tight text-white select-none font-mono">
                {formatSimTime(simTime)}
              </p>
              
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSimToggle}
                  className="rounded-lg bg-zinc-950 hover:bg-zinc-900 p-2 text-zinc-200 border border-zinc-800 transition cursor-pointer flex items-center justify-center"
                  title={simTimerRunning ? "Pause" : "Start"}
                >
                  {simTimerRunning ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSimReset}
                  className="rounded-lg bg-zinc-950 hover:bg-zinc-900 p-2 text-zinc-400 border border-zinc-800 transition cursor-pointer flex items-center justify-center"
                  title="Reset"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSimDistract}
                  className="rounded-lg bg-red-950/40 hover:bg-red-950/60 px-3 py-2 text-xs font-black text-red-400 border border-red-900/20 transition cursor-pointer"
                >
                  Pause / Distracted 🤡
                </button>
              </div>
            </div>

            {/* Illustrative Roast Alert bubble */}
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 text-left">
              <div className="flex gap-2.5 items-start">
                <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400 shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                    Focus Cop says ({simSpiceLevel} Roast):
                  </span>
                  <p className="mt-1 text-xs font-semibold text-amber-100 leading-relaxed italic">
                    "{simRoast}"
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Task List */}
            <div className="mt-4 space-y-2 border-t border-zinc-900 pt-4">
              <div className="flex items-center justify-between rounded-lg bg-zinc-900/20 border border-zinc-900 p-2.5 text-zinc-500">
                <span className="text-xs line-through">Draft blog post review</span>
                <span className="text-[10px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">DONE</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-900/40 border border-zinc-850 p-2.5 text-zinc-300">
                <span className="text-xs">Customize roast insults</span>
                <span className="text-[10px] font-black text-teal-400 bg-teal-950/40 border border-teal-900/30 px-2 py-0.5 rounded">NEXT</span>
              </div>
            </div>

          </div>

          {/* Floating Badges */}
          <div className="absolute right-[-15px] top-[15%] hidden rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl lg:block">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded bg-teal-500/20 text-teal-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500">Today</p>
                <p className="text-xs font-black text-white">4 focus sprints</p>
              </div>
            </div>
          </div>

          <div className="absolute left-[-20px] bottom-[15%] hidden rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl lg:block">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded bg-purple-500/20 text-purple-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-zinc-500">Tone</p>
                <p className="text-xs font-black text-white">Custom Satire</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature section */}
      <Features onSelectFeature={onSelectFeature} />
      
    </main>
  );
}

export default Hero;
