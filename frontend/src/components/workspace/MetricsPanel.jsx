import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Cpu, Gauge, Sparkles } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { fetchMetrics, normalizeError } from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

function MetricBar({ label, value, max = 10, color = "#38bdf8" }) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CircleStat({ label, value, unit, max = 100 }) {
  const normalized = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-center">
      <div className="flex items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-950">
          <div className="absolute inset-0 rounded-full border border-slate-800" />
          <div className="absolute inset-0 rounded-full bg-cyan-500/10" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white">
            <span className="text-lg font-semibold">{value}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-400">{label}</div>
      {unit && <div className="mt-1 text-xs text-slate-500">{unit}</div>}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}

export default function MetricsPanel() {
  const { rtl, filename, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(cache.metrics || null);

  useEffect(() => {
    let mounted = true;

    async function loadMetrics() {
      if (!rtl) {
        setError("Upload an RTL file first to calculate metrics.");
        return;
      }
      if (cache.metrics) {
        setMetrics((prev) => (prev === cache.metrics ? prev : cache.metrics));
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetchMetrics(rtl);
        if (!mounted) return;
        setMetrics(response.metrics);
        setToolCache("metrics", response.metrics);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMetrics();
    return () => {
      mounted = false;
    };
  }, [rtl, cache.metrics, setToolCache]);

  const refreshMetrics = async () => {
    if (!rtl) {
      setError("Upload an RTL file first to calculate metrics.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetchMetrics(rtl);
      setMetrics(response.metrics);
      setToolCache("metrics", response.metrics);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const metricItems = metrics
    ? [
        { label: "Inputs", value: metrics.inputs ?? 0, max: 16, color: "#38bdf8" },
        { label: "Outputs", value: metrics.outputs ?? 0, max: 16, color: "#0ea5e9" },
        { label: "Registers", value: metrics.registers ?? 0, max: 16, color: "#06b6d4" },
        { label: "Wires", value: metrics.wires ?? 0, max: 32, color: "#22d3ee" },
      ]
    : [];

  const statItems = metrics
    ? [
        { label: "Estimated Area", value: metrics.estimated_area ?? 0, unit: "unit" },
        { label: "Estimated Delay", value: metrics.estimated_delay_ns ?? 0, unit: "ns" },
        { label: "Complexity", value: metrics.complexity_score ?? 0, unit: "score" },
      ]
    : [];

  return (
    <motion.div
      key="metrics"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">RTL Metrics</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Design metrics and implementation estimates</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Metrics are computed only when this page opens. Visualize area, timing, complexity, and resource estimates with responsive cards
              and animated indicators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={!rtl || loading} variant="secondary" onClick={refreshMetrics}>
              {loading ? "Refreshing…" : "Refresh metrics"}
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
              <Cpu className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Calculating metrics</p>
              <p className="mt-2 text-sm text-slate-400">This may take a few seconds depending on RTL complexity.</p>
            </div>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-rose-300" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {metrics && !loading && !error && (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {metricItems.map((item) => (
                <Card key={item.label} className="bg-slate-950/90 border-slate-800">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                    </div>
                    <div className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
                      metric
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((item.value / item.max) * 100))}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-950/90 border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Resource & timing estimates</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Hardware metrics</h3>
                  </div>
                  <Gauge className="text-cyan-300" />
                </div>
                <div className="mt-6 space-y-4">
                  <MetricBar label="Always blocks" value={metrics.always_blocks ?? 0} max={10} />
                  <MetricBar label="Assign statements" value={metrics.assigns ?? 0} max={15} />
                  <MetricBar label="Wires" value={metrics.wires ?? 0} max={20} />
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-950/90 border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Complexity</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Implementation score</h3>
                </div>
                <Sparkles className="text-cyan-300" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-6">
                {statItems.map((item) => (
                  <CircleStat key={item.label} label={item.label} value={item.value} unit={item.unit} max={item.label === "Complexity" ? 20 : item.value + 10} />
                ))}
              </div>
            </Card>

            <Card className="bg-slate-950/90 border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Design Complexity</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Metric summary</h3>
                </div>
                <BarChart3 className="text-cyan-300" />
              </div>
              <div className="mt-6 grid gap-3">
                <MetricBar label="Registers" value={metrics.registers ?? 0} max={20} />
                <MetricBar label="Inputs + Outputs" value={(metrics.inputs ?? 0) + (metrics.outputs ?? 0)} max={20} />
                <MetricBar label="Area score" value={metrics.estimated_area ?? 0} max={50} />
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
