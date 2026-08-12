import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowRight, CheckCircle2, RefreshCcw, Sparkles } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { optimizeRtl, normalizeError } from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";

function CodeDiffViewer({ title, subtitle, code, changedLines, copyText }) {
  const changedSet = useMemo(() => new Set(changedLines), [changedLines]);

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={copyText || code || ""} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950">
        <SyntaxHighlighter
          language="verilog"
          style={oneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{
            borderRadius: 24,
            fontSize: 13,
            margin: 0,
            padding: 18,
            maxHeight: 640,
            overflow: "auto",
            backgroundColor: "#0f172a",
          }}
          lineProps={(lineNumber) => ({
            style: changedSet.has(lineNumber)
              ? {
                  backgroundColor: "rgba(56,189,248,0.12)",
                }
              : {},
          })}
        >
          {code || "// No RTL available"}
        </SyntaxHighlighter>
      </div>
    </Card>
  );
}

export default function OptimizePanel() {
  const { rtl, filename, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimized, setOptimized] = useState(cache.optimize?.optimized_code || "");
  const [summary, setSummary] = useState(cache.optimize?.summary || "");
  const [improvements, setImprovements] = useState(cache.optimize?.improvements || []);

  useEffect(() => {
    let mounted = true;

    async function loadOptimization() {
      if (!rtl) {
        setError("Upload RTL first to run optimization.");
        return;
      }

      if (cache.optimize) {
        const cachedOptimize = cache.optimize;
        setOptimized((prev) => (prev === (cachedOptimize.optimized_code || "") ? prev : (cachedOptimize.optimized_code || "")));
        setSummary((prev) => (prev === (cachedOptimize.summary || "") ? prev : (cachedOptimize.summary || "")));
        setImprovements((prev) => {
          const incoming = cachedOptimize.improvements || [];
          if (prev?.length === incoming.length && prev.every((value, index) => value === incoming[index])) {
            return prev;
          }
          return incoming;
        });
        return;
      }

      setLoading(true);
      setError("");
      try {
        const result = await optimizeRtl(rtl);
        if (!mounted) return;
        setOptimized(result.optimized_code || "");
        setSummary(result.summary || "");
        setImprovements(result.improvements || []);
        setToolCache("optimize", result);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOptimization();
    return () => {
      mounted = false;
    };
  }, [rtl, cache.optimize, setToolCache]);

  const refreshOptimization = async () => {
    if (!rtl) {
      setError("Upload RTL first to run optimization.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await optimizeRtl(rtl);
      setOptimized(result.optimized_code || "");
      setSummary(result.summary || "");
      setImprovements(result.improvements || []);
      setToolCache("optimize", result);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const originalCode = rtl || "";
  const optimizedCode = optimized || "";
  const changedLines = useMemo(() => {
    const sourceLines = originalCode.split("\n");
    const targetLines = optimizedCode.split("\n");
    const maxLines = Math.max(sourceLines.length, targetLines.length);
    const diff = [];

    for (let i = 0; i < maxLines; i += 1) {
      if ((sourceLines[i] || "") !== (targetLines[i] || "")) {
        diff.push(i + 1);
      }
    }
    return diff;
  }, [originalCode, optimizedCode]);

  return (
    <motion.div
      key="optimize"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Optimization</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Original vs optimized RTL</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Optimization runs only when you open this page. Compare inputs side by side and review highlighted changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!rtl || loading} variant="secondary" onClick={refreshOptimization}>
              {loading ? "Optimizing…" : "Refresh optimization"}
            </Button>
            <div className="rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              {filename || "No RTL file loaded"}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <Card className="border-slate-800 bg-slate-950/90">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
              <RefreshCcw className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Optimizing RTL</p>
            </div>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-200">
          <div className="flex items-center gap-3">
            <ArrowRight className="text-rose-300" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <CodeDiffViewer
            title="Original RTL"
            subtitle="Uploaded file before optimization"
            code={originalCode}
            changedLines={changedLines}
            copyText={originalCode}
          />
          <CodeDiffViewer
            title="Optimized RTL"
            subtitle="AI-suggested optimization result"
            code={optimizedCode}
            changedLines={changedLines}
            copyText={optimizedCode}
          />
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="bg-slate-950/90 border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Optimization Summary</p>
                <h3 className="mt-2 text-xl font-semibold text-white">What changed</h3>
              </div>
              <Sparkles className="text-cyan-300" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-3xl bg-slate-900/70 p-4 text-sm text-slate-300">
                {summary || "No summary available."}
              </div>
            </div>
          </Card>

          <Card className="bg-slate-950/90 border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Estimated Improvements</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Expected benefits</h3>
              </div>
              <CheckCircle2 className="text-cyan-300" />
            </div>
            <div className="mt-6 grid gap-3">
              {improvements.length > 0 ? (
                improvements.map((item, index) => (
                  <div key={index} className="rounded-3xl bg-slate-900/70 p-4 text-sm text-slate-300">
                    <span className="font-medium text-slate-100">•</span> {item}
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-slate-900/70 p-4 text-sm text-slate-300">
                  No improvement details available.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
