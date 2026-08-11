import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download, RefreshCcw, Terminal, Sparkles } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { fetchTestbench, normalizeError } from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";

export default function TestbenchPanel() {
  const { rtl, filename, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testbench, setTestbench] = useState(cache.testbench?.code || "");

  useEffect(() => {
    let mounted = true;

    async function loadTestbench() {
      if (!rtl) {
        setError("Upload RTL first to generate a testbench.");
        return;
      }

      if (cache.testbench) {
        setTestbench((prev) => (prev === (cache.testbench?.code || "") ? prev : (cache.testbench?.code || "")));
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetchTestbench(rtl);
        if (!mounted) return;
        setTestbench(response.testbench || response.code || "");
        setToolCache("testbench", {
          code: response.testbench || response.code || "",
          summary: response.summary || "",
        });
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTestbench();
    return () => {
      mounted = false;
    };
  }, [rtl, cache.testbench, setToolCache]);

  const refreshTestbench = async () => {
    if (!rtl) {
      setError("Upload RTL first to generate a testbench.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetchTestbench(rtl);
      setTestbench(response.testbench || response.code || "");
      setToolCache("testbench", {
        code: response.testbench || response.code || "",
        summary: response.summary || "",
      });
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTestbench = () => {
    if (!testbench) return;
    const blob = new Blob([testbench], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename ? filename.replace(/\.v$|\.sv$|\.vh$|\.svh$/i, "") : "testbench"}_tb.v`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      key="testbench"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Testbench Generation</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Auto-generated Verilog testbench</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                <Terminal size={14} />
                {filename || "Uploaded RTL"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                <Sparkles size={14} />
                Generated when this tab is opened
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!rtl || loading} variant="secondary" onClick={refreshTestbench}>
              {loading ? "Generating…" : "Regenerate"}
            </Button>
            <CopyButton text={testbench || ""} />
            <Button disabled={!testbench} variant="secondary" onClick={downloadTestbench}>
              <Download size={14} />
              Download
            </Button>
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
              <p className="text-lg font-semibold text-white">Generating testbench</p>
              <p className="mt-1 text-sm text-slate-400">This page calls the backend only once when opened.</p>
            </div>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-200">
          <div className="flex items-center gap-3">
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <Card className="bg-slate-950/90 border-slate-800">
          <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Generation Summary</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Testbench overview</h3>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Length</span>: {testbench ? testbench.split("\n").length : 0} lines
              </div>
              <div className="rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Copy ready</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950">
            <SyntaxHighlighter
              language="verilog"
              style={oneDark}
              showLineNumbers
              wrapLongLines
              customStyle={{ borderRadius: 24, fontSize: 13, margin: 0, padding: 20, maxHeight: 700, overflow: "auto" }}
            >
              {testbench || "// Testbench output will appear here."}
            </SyntaxHighlighter>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
