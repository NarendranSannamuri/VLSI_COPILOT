import { useCallback, useState } from "react";
import { normalizeError, optimizeRtl } from "../services/api";

export function useRtlOptimize(rtl) {
  const [optimized, setOptimized] = useState("");
  const [summary, setSummary] = useState("");
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const optimize = useCallback(async () => {
    if (!rtl) return;

    setLoading(true);
    setError("");

    try {
      const data = await optimizeRtl(rtl);
      setOptimized(data.optimized_code || "");
      setSummary(data.summary || "");
      setImprovements(data.improvements || []);
    } catch (err) {
      const normalized = normalizeError(err);
      setError(normalized.message);
      setOptimized("");
      setSummary("");
      setImprovements([]);
    } finally {
      setLoading(false);
    }
  }, [rtl]);

  return {
    optimized,
    summary,
    improvements,
    loading,
    error,
    optimize,
  };
}

export default useRtlOptimize;
