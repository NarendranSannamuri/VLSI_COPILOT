import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRtlWorkspace } from "../context/RtlWorkspaceContext";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceCanvas from "../components/workspace/WorkspaceCanvas";

function Workspace() {
  const { hasRtl, clearWorkspace } = useRtlWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    // Keep hook for future session restore
  }, []);

  if (!hasRtl) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden text-white">
      <WorkspaceSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.06),_transparent_28%),#070b14]">
        <header className="sticky top-0 z-30 shrink-0 border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">Engineering Workspace</h1>
              <p className="mt-1 text-sm text-slate-400">Interactive EDA tools and project insights on demand.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-3xl border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
              onClick={() => {
                clearWorkspace();
                navigate("/");
              }}
            >
              Upload new RTL
            </button>
          </div>
        </header>
        <WorkspaceCanvas />
      </div>
    </div>
  );
}

export default Workspace;
