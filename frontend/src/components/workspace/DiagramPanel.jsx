import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDiagram, normalizeError } from "../../services/api";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import Card from "../ui/Card";
import ErrorBanner from "../ui/ErrorBanner";
import RTLDiagram from "../RTLDiagram";
import { Loader2 } from "lucide-react";

export default function DiagramPanel() {
  const { rtl, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDiagram() {
      if (!rtl) {
        if (mounted) setError("Upload RTL first to generate a block diagram.");
        return;
      }

      if (cache.diagram) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetchDiagram(rtl);
        if (!mounted) return;
        setToolCache("diagram", response);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDiagram();

    return () => {
      mounted = false;
    };
  }, [cache.diagram, rtl, setToolCache]);

  const diagram = cache.diagram;

  return (
    <motion.div
      key="diagram"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Block Diagram</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Interactive RTL Graph</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Visualize the active design structure with zoom, pan, selection and hover details.
            </p>
          </div>
        </div>
      </Card>

      {error && !loading && (
        <ErrorBanner message={error} onDismiss={() => setError("")} />
      )}

      {loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-slate-300">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
            <div>
              <p className="text-lg font-semibold text-white">Generating diagram</p>
              <p className="mt-2 text-sm text-slate-400">The block diagram appears after this page is opened.</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && rtl && (
        <RTLDiagram graph={diagram} />
      )}

      {!rtl && !loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No RTL loaded</p>
          <p className="mt-3 text-sm text-slate-400">Upload RTL from the dashboard before opening the Block Diagram page.</p>
        </Card>
      )}
    </motion.div>
  );
}
