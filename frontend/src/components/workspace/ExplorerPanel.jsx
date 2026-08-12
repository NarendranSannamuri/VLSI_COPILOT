import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { fetchAnalysis, normalizeError } from "../../services/api";
import { FileCode2, Layers, Box, GitBranch, Search, ChevronDown, ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";

const TABS = [
  { id: "source", label: "Source Code", icon: FileCode2 },
  { id: "parsed", label: "Parsed Modules", icon: Layers },
  { id: "hierarchy", label: "Module Hierarchy", icon: GitBranch },
  { id: "signals", label: "Signal Connections", icon: Box },
];

function HierarchyNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(level === 0);

  if (!node) {
    return null;
  }

  const name = node.name || node.module || node.instance || "Unnamed";
  const children = node.children || node.instances || node.submodules || node.nodes || [];
  const meta = node.type || node.kind || node.moduleType || "Module";

  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-950/80 p-4 ${level > 0 ? "ml-5" : ""}`}>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left text-sm text-slate-100 transition hover:text-cyan-300"
      >
        <span className="flex items-center gap-2 font-semibold">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {name}
        </span>
        <span className="text-xs text-slate-400">{meta}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {node.instanceOf && (
            <div className="rounded-2xl bg-slate-900/80 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Instance</p>
              <p className="mt-1 text-slate-100">{node.instanceOf}</p>
            </div>
          )}
          {node.ports && (
            <div className="rounded-2xl bg-slate-900/80 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ports</p>
              <p className="mt-1 text-slate-100">{Array.isArray(node.ports) ? node.ports.join(", ") : String(node.ports)}</p>
            </div>
          )}
          {children.length > 0 && (
            <div className="space-y-3">
              {children.map((child, idx) => (
                <HierarchyNode key={child.name || child.module || idx} node={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplorerPanel({ rtlOverride } = {}) {
  const { filename, rtl: rtlFromCtx, cache, setToolCache } = useRtlWorkspace();
  const rtl = rtlOverride ?? rtlFromCtx ?? "";

  const [activeTab, setActiveTab] = useState("source");
  const [analysis, setAnalysis] = useState(cache.analysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const lines = useMemo(() => rtl.split("\n"), [rtl]);
  const queryLower = searchQuery.trim().toLowerCase();
  const matchCount = useMemo(
    () => (queryLower ? lines.filter((line) => line.toLowerCase().includes(queryLower)).length : 0),
    [lines, queryLower]
  );

  const needAnalysis = useMemo(() => activeTab !== "source", [activeTab]);

  useEffect(() => {
    let mounted = true;

    async function loadAnalysis() {
      if (!needAnalysis) return;
      if (analysis) return;
      if (!rtl) {
        setError("No RTL source is available to analyze.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await fetchAnalysis(rtl);
        if (!mounted) return;
        setAnalysis(data);
        setToolCache("analysis", data);
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
  }, [activeTab, analysis, needAnalysis, rtl, setToolCache]);

  const modules = analysis?.parsed_data?.modules || analysis?.modules || [];
  const hierarchy = analysis?.parsed_data?.hierarchy || analysis?.hierarchy || null;
  const signals = analysis?.parsed_data?.signals || analysis?.signals || [];

  function renderHierarchy(rawHierarchy) {
    if (!rawHierarchy) return null;
    if (Array.isArray(rawHierarchy)) {
      return rawHierarchy.map((node, idx) => <HierarchyNode key={idx} node={node} />);
    }
    if (typeof rawHierarchy === "object") {
      return <HierarchyNode node={rawHierarchy} />;
    }
    return <pre className="whitespace-pre-wrap text-sm text-slate-200">{rawHierarchy}</pre>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">RTL Explorer</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Inspect your uploaded RTL source, review parsed modules, explore hierarchy, and verify signal connectivity.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 overflow-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={rtl || ""} />
          <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(rtl || "")}`} download={filename || "rtl.v"}>
            <Button variant="secondary" className="!px-3 !py-1.5 !text-sm">
              Download
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <div className="min-h-[46vh] p-4">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "source" && (
              <motion.div
                key="source"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode2 size={18} className="text-cyan-300" />
                    <div>
                      <div className="text-sm font-semibold text-slate-100">Source Code</div>
                      <div className="text-xs text-slate-400">{filename || "Uploaded RTL"}</div>
                    </div>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] lg:w-auto">
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search RTL source"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40"
                      />
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Matches</div>
                      <div className="mt-1 font-semibold text-slate-100">{matchCount}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/90 shadow-[0_0_0_1px_rgba(90,100,125,0.08)]">
                  <SyntaxHighlighter
                    language="verilog"
                    style={oneDark}
                    showLineNumbers
                    lineNumberStyle={(lineNumber) => ({ color: queryLower && lines[lineNumber - 1].toLowerCase().includes(queryLower) ? "#7dd3fc" : "#94a3b8" })}
                    wrapLongLines
                    customStyle={{ borderRadius: 24, fontSize: 13, margin: 0, padding: 24, maxHeight: 560, overflow: "auto", background: "#0f172a" }}
                  >
                    {rtl || "// Load your RTL source from the upload page first."}
                  </SyntaxHighlighter>
                </div>
              </motion.div>
            )}

            {activeTab === "parsed" && (
              <motion.div
                key="parsed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Layers size={18} className="text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Parsed Modules</div>
                    <div className="text-xs text-slate-400">A clean view of each module and its structure.</div>
                  </div>
                </div>

                {loading && <div className="text-sm text-slate-400">Parsing RTL for module details…</div>}
                {error && <div className="text-sm text-rose-400">{error}</div>}
                {!loading && !error && modules.length === 0 && <div className="text-sm text-slate-400">No modules were detected in the parsed RTL data.</div>}

                {!loading && modules.length > 0 && (
                  <div className="grid gap-4">
                    {modules.map((module, index) => {
                      const moduleName = module.name || module.module || `Module ${index + 1}`;
                      return (
                        <div key={moduleName} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_0_0_1px_rgba(90,100,125,0.08)]">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{moduleName}</p>
                              <p className="text-xs text-slate-400">{module.description || module.summary || "Module interface and implementation details."}</p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                                Ports
                                <div className="mt-1 font-semibold text-slate-100">{Array.isArray(module.ports) ? module.ports.length : module.ports ? "1+" : "0"}</div>
                              </div>
                              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                                Instances
                                <div className="mt-1 font-semibold text-slate-100">{Array.isArray(module.instances) ? module.instances.length : module.instances ? "1+" : "0"}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl bg-slate-900/80 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Ports</p>
                              <p className="mt-3 text-sm text-slate-200">{Array.isArray(module.ports) ? module.ports.join(", ") : module.ports || "—"}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-900/80 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Parameters</p>
                              <p className="mt-3 text-sm text-slate-200">{Array.isArray(module.parameters) ? module.parameters.join(", ") : module.parameters || "—"}</p>
                            </div>
                          </div>

                          {module.source && (
                            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/90">
                              <div className="border-b border-slate-800 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500">Module Source</div>
                              <SyntaxHighlighter
                                language="verilog"
                                style={oneDark}
                                showLineNumbers
                                wrapLongLines
                                customStyle={{ borderRadius: "0 0 24px 24px", fontSize: 12, margin: 0, padding: 16, background: "#020617" }}
                              >
                                {module.source}
                              </SyntaxHighlighter>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "hierarchy" && (
              <motion.div
                key="hierarchy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <GitBranch size={18} className="text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Module Hierarchy</div>
                    <div className="text-xs text-slate-400">Browse the inferred module tree in a collapsible view.</div>
                  </div>
                </div>

                {loading && <div className="text-sm text-slate-400">Building hierarchy view…</div>}
                {error && <div className="text-sm text-rose-400">{error}</div>}
                {!loading && !error && !hierarchy && <div className="text-sm text-slate-400">Hierarchy data is not yet available from the backend.</div>}

                {!loading && hierarchy && (
                  <div className="space-y-4">{renderHierarchy(hierarchy)}</div>
                )}
              </motion.div>
            )}

            {activeTab === "signals" && (
              <motion.div
                key="signals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Box size={18} className="text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Signal Connections</div>
                    <div className="text-xs text-slate-400">Review signal names, widths and connection endpoints.</div>
                  </div>
                </div>

                {loading && <div className="text-sm text-slate-400">Loading signal mapping…</div>}
                {error && <div className="text-sm text-rose-400">{error}</div>}
                {!loading && !error && signals.length === 0 && <div className="text-sm text-slate-400">No signal connection information was returned.</div>}

                {!loading && signals.length > 0 && (
                  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90">
                    <div className="grid grid-cols-[1.8fr_1fr_1fr_2fr] gap-px bg-slate-900/95 text-xs uppercase tracking-[0.25em] text-slate-500">
                      <div className="px-4 py-3">Signal</div>
                      <div className="px-4 py-3">Type</div>
                      <div className="px-4 py-3">Width</div>
                      <div className="px-4 py-3">Connections</div>
                    </div>
                    {signals.map((signal, index) => (
                      <div key={signal.name || signal.signal || index} className="grid grid-cols-[1.8fr_1fr_1fr_2fr] gap-px bg-slate-950 text-sm text-slate-200">
                        <div className="bg-slate-950 px-4 py-3 font-medium">{signal.name || signal.signal || `signal-${index + 1}`}</div>
                        <div className="bg-slate-950 px-4 py-3 text-slate-400">{signal.type || signal.direction || "—"}</div>
                        <div className="bg-slate-950 px-4 py-3 text-slate-400">{signal.width || signal.range || "—"}</div>
                        <div className="bg-slate-950 px-4 py-3 text-slate-400">
                          {Array.isArray(signal.connections)
                            ? signal.connections.join(", ")
                            : signal.connection || signal.to || signal.from || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
