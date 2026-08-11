import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";
import { useRtlWorkspace } from "../context/RtlWorkspaceContext";

export default function DashboardPage() {
  const { filename, rtl } = useRtlWorkspace();

  const result = {
    filename: filename || "",
    verilog_text: rtl || "",
    localOnly: true,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_35%),#070b14] text-white">
      <Navbar variant="workspace" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="sticky top-4 z-20 rounded-[2rem] border border-slate-800/70 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.3)] backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200">
                EDA workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Professional RTL dashboard</h1>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Uploaded RTL stays in your workspace state and is ready for analysis, diagrams, metrics, and export workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Active file</div>
              <div className="mt-1 truncate font-medium text-slate-100">{filename || "No RTL loaded yet"}</div>
            </div>
          </div>
        </motion.header>

        <Dashboard result={result} />
      </main>
    </div>
  );
}
