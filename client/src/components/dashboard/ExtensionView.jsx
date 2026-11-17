import { Terminal } from "lucide-react";

export default function ExtensionView() {
  return (
    <div className="glass-card mx-auto max-w-4xl rounded-3xl border border-slate-800/80 p-6 shadow-xl md:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-white">
            <Terminal className="h-6 w-6 text-teal-400" />
            Focus Cop Browser Extension
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Redirect selected distracting sites to ZenSprint during focus sessions.
          </p>
        </div>
        <span className="rounded-xl border border-teal-500/30 bg-teal-950/40 px-3.5 py-1.5 text-xs font-black text-teal-300">
          Chrome extension
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <h4 className="text-sm font-black text-white">Install from Chrome Web Store</h4>
          <p className="text-xs leading-relaxed text-slate-400">
            Search for <strong className="text-slate-200">ZenSprint Focus Cop</strong> in the Chrome Web Store and select <strong className="text-slate-200">Add to Chrome</strong>. The listing will be available after its review is complete.
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            The extension redirects selected distracting sites to this dashboard. You can disable or remove it at any time from Chrome's Extensions page.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <h4 className="text-sm font-black text-white">No token setup required</h4>
          <p className="text-xs leading-relaxed text-slate-400">
            The extension uses this dashboard address automatically. It checks only the dashboard's temporary break settings to restore redirects when a break expires; it does not need your ZenSprint sign-in token.
          </p>
          <a
            href="https://zensprint-vy33.vercel.app/privacy.html"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-semibold text-teal-300 underline underline-offset-2"
          >
            Read the extension privacy policy
          </a>
        </section>
      </div>
    </div>
  );
}
