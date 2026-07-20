import { Terminal, Download, ShieldAlert, Sparkles, Check, Copy } from "lucide-react";
import { useState } from "react";

export default function ExtensionView() {
  const [copiedToken, setCopiedToken] = useState(false);
  const token = localStorage.getItem("zensprint_token") || "";

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800/80 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Terminal className="h-6 w-6 text-teal-400" />
            Focus Cop Browser Extension Setup
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Connect the ZenSprint Chrome extension to block distracting websites and tab switches in real time.
          </p>
        </div>

        <span className="rounded-xl bg-teal-950/40 border border-teal-500/30 px-3.5 py-1.5 text-xs font-black text-teal-300">
          v1.0 Ready 🧩
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Step 1: Install */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-600 text-xs font-black text-white">
              1
            </span>
            <h4 className="text-sm font-black text-white">Download & Unpack Extension</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The extension files are located directly in your project folder under <code className="text-teal-300 font-mono">/extension</code>.
          </p>

          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside font-medium pt-1">
            <li>Open Chrome and navigate to <code className="text-teal-300 font-mono">chrome://extensions</code></li>
            <li>Enable <strong>Developer mode</strong> in top-right toggle</li>
            <li>Click <strong>Load unpacked</strong> and select the <code className="text-teal-300 font-mono">ZenSprint/extension</code> folder</li>
          </ol>
        </div>

        {/* Step 2: Auth Token */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-600 text-xs font-black text-white">
              2
            </span>
            <h4 className="text-sm font-black text-white">Copy Your Extension Auth Token</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Paste this authentication token into the extension popup options so it syncs with your active ZenSprint user account.
          </p>

          <div className="relative mt-2">
            <input
              type="text"
              readOnly
              value={token ? `${token.substring(0, 28)}...` : "Log in to view auth token"}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-xs font-mono text-slate-300 pr-20"
            />
            <button
              onClick={handleCopyToken}
              disabled={!token}
              className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 px-3 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1"
            >
              {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedToken ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
