import { motion } from "framer-motion";
import { FileCode2, Sparkles, Activity, Bug, GitBranch } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function OverviewPanel() {
  const { filename, rtl, cache, setActiveTool } = useRtlWorkspace();
  const hasRtl = Boolean(rtl);
  const summary = cache.analysis?.summary || "Use the sidebar tools to analyze RTL, generate diagrams, and inspect your design.";

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Workspace overview</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Ready for your design.</h1>
                <p className="mt-3 text-sm leading-7 text-slate-400">Your uploaded RTL is available throughout the workspace. Choose a tool from the left to start analysis, diagramming, optimization, or AI review.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                <div className="font-medium text-slate-100">Current file</div>
                <div className="mt-1 truncate">{filename || "No file loaded"}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick status</p>
                <p className="mt-3 text-sm text-slate-300">{summary}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Next step</p>
                <p className="mt-3 text-sm text-slate-300">Open RTL Explorer or Analysis to fetch the first backend result for this design.</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3 text-cyan-300">
              <Sparkles size={20} />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Highlights</p>
                <p className="mt-1 text-sm text-slate-400">Entry points for your workflow.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                { icon: FileCode2, label: "Explore RTL", tool: "explorer" },
                { icon: GitBranch, label: "View block diagram", tool: "diagram" },
                { icon: Activity, label: "Check metrics", tool: "metrics" },
                { icon: Bug, label: "Run bug detection", tool: "bugs" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tool}
                    type="button"
                    onClick={() => setActiveTool(item.tool)}
                    className="flex items-center justify-between rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/20 hover:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/70 text-cyan-300">
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="font-semibold text-white">{item.label}</div>
                        <div className="mt-1 text-xs text-slate-500">Open this tool now</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">Open</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
