import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, FileCode2, Loader2, UploadCloud, Play } from "lucide-react";
import { useRtlWorkspace } from "../context/RtlWorkspaceContext";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";

function Home() {
  const navigate = useNavigate();
  const { loadFile, uploading, uploadError, setUploadError, setActiveTool } = useRtlWorkspace();
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;
      setSelectedFile(file);
      setFileLoaded(false);
      try {
        await loadFile(file);
        setFileLoaded(true);
      } catch {
        // error stored in context
      }
    },
    [loadFile]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleStartAnalysis = () => {
    if (!selectedFile && !fileLoaded) return;
    setActiveTool("explorer");
    navigate("/workspace");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_22%),linear-gradient(180deg,#020617_0%,#070b14_55%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-20 z-0 h-72 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16"
      >
        <section className="glass-strong overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-10 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                <Cpu size={14} />
                AI-Powered EDA Workspace
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                VLSI Copilot
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                Upload Verilog once and move from RTL to analysis, optimization, design exploration and AI-powered engineering insights in a premium workspace.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Instant</p>
                  <p className="mt-3 text-lg font-semibold text-white">Drag & drop RTL files</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">On demand</p>
                  <p className="mt-3 text-lg font-semibold text-white">Load only the tools you need</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-950/90 p-9 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/15">
                  <UploadCloud size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Upload RTL</p>
                  <p className="text-sm text-slate-500">Drop .v or .sv files to begin.</p>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`glass mt-8 border-2 border-dashed p-8 transition ${
                  dragging
                    ? "border-cyan-400/60 bg-cyan-500/10"
                    : "border-slate-700 hover:border-cyan-400/35"
                }`}
              >
                <UploadCloud className="mx-auto text-cyan-300" size={36} />
                <p className="mt-4 text-lg font-semibold text-slate-100">Drag & drop your RTL file</p>
                <p className="mt-2 text-sm text-slate-400">
                  Accepts <span className="font-mono text-cyan-300">.v</span> and <span className="font-mono text-cyan-300">.sv</span>
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".v,.sv"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                <Button
                  variant="secondary"
                  className="mt-6 w-full justify-center"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading file...
                    </>
                  ) : (
                    "Browse files"
                  )}
                </Button>

                {selectedFile && (
                  <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-left">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Selected RTL</p>
                    <p className="mt-1 flex items-center gap-2 font-mono text-sm text-white">
                      <FileCode2 size={16} className="text-cyan-300" />
                      {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>

              <Button
                className="mt-6 w-full justify-center text-base font-semibold py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                disabled={!selectedFile || uploading}
                onClick={handleStartAnalysis}
              >
                <Play size={18} fill="currentColor" />
                Analyze RTL
              </Button>
            </div>
          </div>

          {uploadError && (
            <div className="mt-10 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5 text-left text-sm text-rose-200">
              <ErrorBanner message={uploadError} onDismiss={() => setUploadError("")} />
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}

export default Home;
