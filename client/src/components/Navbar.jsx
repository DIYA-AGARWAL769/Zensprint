import { LayoutDashboard, Settings2, Home, LogOut, User, Flame, Coins } from "lucide-react";

function Navbar({ currentView, setCurrentView, user, onLogout }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 px-5 py-3.5 text-slate-200 backdrop-blur-xl md:px-10 shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        
        {/* Logo */}
        <button 
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-3 bg-transparent border-0 cursor-pointer text-left group"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-lg font-black text-white shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            Z
          </span>
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            Zen<span className="text-teal-400">Sprint</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-2 text-xs font-black md:flex">
          <button 
            onClick={() => setCurrentView("landing")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition cursor-pointer ${
              currentView === "landing" 
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300 shadow-sm" 
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          
          <button 
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition cursor-pointer ${
              currentView === "dashboard" 
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300 shadow-sm" 
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Sprint Dashboard
          </button>

          <button 
            onClick={() => setCurrentView("settings")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition cursor-pointer ${
              currentView === "settings" 
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300 shadow-sm" 
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Roast Rules
          </button>
        </div>

        {/* Action Button / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User Badge */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-300">
                <User className="h-3.5 w-3.5 text-teal-400" />
                <span>{user.username}</span>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-950/40 hover:border-red-900 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setCurrentView("dashboard")}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
