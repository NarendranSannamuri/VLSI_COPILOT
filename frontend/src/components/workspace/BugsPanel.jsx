import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { fetchBugs, normalizeError } from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

const severityMap = {
  ok: {
    icon: CheckCircle2,
    label: "Pass",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  low: {
    icon: ShieldAlert,
    label: "Low",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  medium: {
    icon: AlertTriangle,
    label: "Warn",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  high: {
    icon: XCircle,
    label: "Fail",
    color: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  },
};

function BugCard({ check }) {
  const severity = severityMap[check.severity?.toLowerCase()] || severityMap.medium;
  const StatusIcon = severity.icon;
  const status = check.status?.toLowerCase();
  const badgeLabel = severity.label;

  return (
    <Card className={`border-l-4 ${severity.color} bg-slate-950/90 border-slate-800`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`mt-1 rounded-full bg-slate-900 p-2 ${severity.color}`}>
            <StatusIcon size={18} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">{check.title || "Untitled check"}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="rounded-full bg-slate-800 px-2 py-1">{badgeLabel}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1">{status || "unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      {check.detail && (
        <div className="mt-4 text-sm text-slate-300">
          <span className="font-semibold text-slate-200">Detail:</span> {check.detail}
        </div>
      )}
      {check.recommendation && (
        <div className="mt-3 text-sm text-slate-300">
          <span className="font-semibold text-slate-200">Recommendation:</span> {check.recommendation}
        </div>
      )}
    </Card>
  );
}

export default function BugsPanel() {
  const { rtl, filename, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(cache.bugs || null);

  useEffect(() => {
    let mounted = true;

    async function loadBugs() {
      if (!rtl) {
        setError("Upload RTL first to scan for issues.");
        return;
      }

      if (cache.bugs) {
        setResult((prev) => (prev === cache.bugs ? prev : cache.bugs));
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetchBugs(rtl);
        if (!mounted) return;
        setResult(response);
        setToolCache("bugs", response);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBugs();
    return () => {
      mounted = false;
    };
  }, [rtl, cache.bugs, setToolCache]);

  const refreshBugs = async () => {
    if (!rtl) {
      setError("Upload RTL first to scan for issues.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetchBugs(rtl);
      setResult(response);
      setToolCache("bugs", response);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const checks = result?.checks ?? [];

  return (
    <motion.div
      key="bugs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Bug Detection</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Issue status cards</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Bug detection runs only when you open this page. Each finding is shown as a status card with severity coloring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={!rtl || loading} variant="secondary" onClick={refreshBugs}>
              {loading ? "Scanning…" : "Refresh scan"}
            </Button>
            <div className="rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              {filename || "No RTL file loaded"}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <Card className="border-slate-800 bg-slate-950/90">
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-slate-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Scanning for RTL issues</p>
            </div>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-rose-500/20 bg-rose-500/5 text-rose-200">
          <div className="flex items-center gap-3">
            <XCircle className="text-rose-300" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {!loading && !error && checks.length === 0 && (
        <Card className="border-slate-800 bg-slate-950/90 text-slate-300">
          <div className="text-sm">No bug checks were returned. Ensure RTL is uploaded and try refreshing.</div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {checks.map((check) => (
          <BugCard key={check.id || check.title} check={check} />
        ))}
      </div>
    </motion.div>
  );
}
