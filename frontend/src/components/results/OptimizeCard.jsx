import { Download, Sparkles } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import ErrorBanner from "../ui/ErrorBanner";
import useRtlOptimize from "../../hooks/useRtlOptimize";

function buildDiffLines(original = "", optimized = "") {
  const left = original.split("\n");
  const right = optimized.split("\n");
  const max = Math.max(left.length, right.length);
  const rows = [];

  for (let i = 0; i < max; i += 1) {
    const a = left[i] ?? "";
    const b = right[i] ?? "";
    let type = "same";
    if (a !== b) {
      if (!a) type = "add";
      else if (!b) type = "del";
      else type = "change";
    }
    rows.push({ a, b, type, line: i + 1 });
  }
  return rows;
}

function OptimizeCard({ rtl }) {
  const { optimized, summary, improvements, loading, error, optimize } =
    useRtlOptimize(rtl);

  const diffRows = optimized ? buildDiffLines(rtl, optimized) : [];

  const downloadOptimized = () => {
    if (!optimized) return;
    const blob = new Blob([optimized], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.v";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">AI RTL Optimizer</h2>
          <p className="mt-1 text-sm text-slate-400">
            Improve style and readability while preserving behavior.
          </p>
        </div>
        <Button onClick={optimize} disabled={loading || !rtl}>
          <Sparkles size={16} />
          {loading ? "Optimizing..." : "Optimize RTL"}
        </Button>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {summary && (
        <p className="mb-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
          {summary}
        </p>
      )}

      {improvements.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-cyan-300">Improvements</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {improvements.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {(rtl || optimized) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Original</h3>
              <CopyButton text={rtl} />
            </div>
            <SyntaxHighlighter
              language="verilog"
              style={oneDark}
              showLineNumbers
              customStyle={{
                borderRadius: 12,
                maxHeight: 360,
                fontSize: 13,
                margin: 0,
              }}
            >
              {rtl || "// No source"}
            </SyntaxHighlighter>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold">Optimized</h3>
              <div className="flex gap-2">
                <CopyButton text={optimized} />
                <Button
                  variant="secondary"
                  className="!px-3 !py-1.5 !text-xs"
                  onClick={downloadOptimized}
                  disabled={!optimized}
                >
                  <Download size={14} />
                  Download
                </Button>
              </div>
            </div>
            <SyntaxHighlighter
              language="verilog"
              style={oneDark}
              showLineNumbers
              customStyle={{
                borderRadius: 12,
                maxHeight: 360,
                fontSize: 13,
                margin: 0,
              }}
            >
              {optimized || "// Run Optimize RTL to generate a result"}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {diffRows.length > 0 && optimized && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Diff View</h3>
          <div className="max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs">
            {diffRows.map((row) => (
              <div
                key={row.line}
                className={`grid grid-cols-[48px_1fr_1fr] gap-2 border-b border-slate-900 px-3 py-1 ${
                  row.type === "add"
                    ? "bg-emerald-500/10"
                    : row.type === "del"
                      ? "bg-red-500/10"
                      : row.type === "change"
                        ? "bg-amber-500/10"
                        : ""
                }`}
              >
                <span className="text-slate-600">{row.line}</span>
                <span className="truncate text-slate-400">{row.a || " "}</span>
                <span className="truncate text-slate-200">{row.b || " "}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default OptimizeCard;
