import {
  Activity,
  Bug,
  CircuitBoard,
  Download,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Network,
  Sparkles,
  TestTube2,
  Wand2,
} from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "explorer", label: "RTL Explorer", icon: FileCode2 },
  { id: "analysis", label: "RTL Analysis", icon: Sparkles },
  { id: "diagram", label: "Block Diagram", icon: GitBranch },
  { id: "schematic", label: "Schematic", icon: Network },
  { id: "metrics", label: "Metrics", icon: Activity },
  { id: "bugs", label: "Bug Detection", icon: Bug },
  { id: "optimize", label: "Optimization", icon: Wand2 },
  { id: "testbench", label: "Testbench", icon: TestTube2 },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "report", label: "Download Report", icon: Download },
];

function WorkspaceSidebar() {
  const { activeTool, setActiveTool, filename, clearWorkspace } = useRtlWorkspace();

  return (
    <aside className="hidden md:flex h-screen w-72 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-3xl">
      <div className="sticky top-0 z-10 border-b border-slate-800/70 bg-slate-950/90 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="float-soft flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/15">
            <CircuitBoard size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">VLSI Copilot</div>
            <p className="mt-1 text-xs text-slate-500">AI hardware workflow</p>
          </div>
        </div>
        <div className="mt-5 rounded-[1.25rem] border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Workspace file</div>
          <div className="mt-1 truncate font-medium text-slate-200" title={filename}>
            {filename || "No file loaded"}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTool === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTool(item.id)}
              className={`group flex w-full items-center gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm font-medium transition-all ${
                active
                  ? "bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                  : "text-slate-300 hover:bg-slate-900/70 hover:text-slate-100"
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                active ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-900/70 text-slate-400 group-hover:bg-slate-800/80 group-hover:text-cyan-300"
              }`}>
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/70 px-4 py-5">
        <button
          type="button"
          onClick={clearWorkspace}
          className="flex w-full items-center justify-center rounded-[1.25rem] border border-slate-700/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 transition hover:border-red-400/30 hover:text-red-300"
        >
          Close workspace
        </button>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
