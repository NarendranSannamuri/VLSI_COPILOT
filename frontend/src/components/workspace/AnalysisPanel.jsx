import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ClipboardList, Sparkles } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { fetchAnalysis, normalizeError } from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function AnalysisPanel() {
  const { rtl, filename, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(cache.analysis || null);

  useEffect(() => {
    let mounted = true;
    async function loadAnalysis() {
      if (!rtl) {
        setError("Upload an RTL file first to run analysis.");
        return;
      }

      if (cache.analysis) {
        setData((prev) => (prev === cache.analysis ? prev : cache.analysis));
        return;
      }

      setLoading(true);
      setError("");
      try {
        const result = await fetchAnalysis(rtl);
        if (!mounted) return;
        setData(result);
        setToolCache("analysis", result);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAnalysis();
    return () => {
      mounted = false;
    };
  }, [rtl, cache.analysis, setToolCache]);

  const summary = useMemo(() => {
    if (!data) return null;
    const { analysis = {}, parsed_data = {}, report = {}, warnings = [], syntax_errors = [], } = data;
    return {
      name: analysis.module_name || parsed_data.module_name || filename || "Unknown",
      inputs: parsed_data.inputs?.length ?? 0,
      outputs: parsed_data.outputs?.length ?? 0,
      assignments: parsed_data.assignments?.length ?? 0,
      complexity: data.report?.design_metrics?.complexity || "Unknown",
      designType: data.report?.design_metrics?.design_type || "Unknown",
      styleIssues: syntax_errors,
      issues: warnings,
      recommendations: [
        report.summary || analysis.rtl_summary || "Review RTL summary for refinement.",
        parsed_data.assignments?.length === 0
          ? "Consider adding assign statements or sequential logic to clarify intent."
          : "Verify signal names and port ordering against the design specification.",
      ],
    };
  }, [data, filename]);

  const refreshAnalysis = async () => {
    if (!rtl) {
      setError("Upload an RTL file first to run analysis.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await fetchAnalysis(rtl);
      setData(result);
      setToolCache("analysis", result);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">RTL Analysis</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Design quality and style summary</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Analysis is performed only when you open this panel. Results are grouped into summary,
              coding style, design issues, and recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              {filename || "No RTL file loaded"}
            </div>
            <Button disabled={!rtl || loading} variant="secondary" onClick={refreshAnalysis}>
              {loading ? "Analyzing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-300">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
            <Activity className="h-7 w-7 animate-spin" />
          </div>
          <p className="text-lg font-semibold text-white">Running RTL analysis</p>
          <p className="mt-2 text-sm text-slate-400">Please wait while the analysis engine inspects your design.</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-200">
          <div className="flex items-center gap-2 text-rose-200">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {summary && !loading && !error && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-6">
            <Card className="space-y-4 bg-slate-950/80 border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Summary</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Design at a glance</h3>
                </div>
                <Sparkles className="text-cyan-300" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Module</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.name}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Inputs</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.inputs}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Outputs</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.outputs}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Assignments</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.assignments}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Complexity</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.complexity}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Design type</p>
                  <p className="mt-2 text-lg font-semibold text-white">{summary.designType}</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 bg-slate-950/80 border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Coding Style</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Style checks</h3>
                </div>
                <ClipboardList className="text-cyan-300" />
              </div>
              {summary.styleIssues.length > 0 ? (
                <div className="space-y-3">
                  {summary.styleIssues.map((issue, index) => (
                    <div key={index} className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">
                      {issue}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No coding style issues detected. RTL is clean and consistent.</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6">
            <Card className="space-y-4 bg-slate-950/80 border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Design Issues</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Potential risks</h3>
                </div>
                <AlertTriangle className="text-cyan-300" />
              </div>
              <div className="space-y-3">
                {summary.issues.map((warning, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    {warning}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4 bg-slate-950/80 border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Recommendations</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Next steps</h3>
                </div>
                <Sparkles className="text-cyan-300" />
              </div>
              <div className="space-y-3">
                {summary.recommendations.map((recommendation, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    {recommendation}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
