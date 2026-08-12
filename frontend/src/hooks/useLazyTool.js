import { useEffect, useState } from "react";
import { normalizeError } from "../services/api";
import { useRtlWorkspace } from "../context/RtlWorkspaceContext";

/**
 * Lazy-fetch a tool endpoint once per tool selection.
 * Caches result in workspace so revisiting the tab does not re-hit the API.
 */
export function useLazyTool(toolKey, fetcher, { enabled = true } = {}) {
  const { rtl, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cached = cache[toolKey];
  const hasCachedValue = Object.prototype.hasOwnProperty.call(cache, toolKey);

  useEffect(() => {
    if (!enabled || !rtl || hasCachedValue) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetcher(rtl);
        if (!cancelled) setToolCache(toolKey, data);
      } catch (err) {
        if (!cancelled) setError(normalizeError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, rtl, cached, toolKey, fetcher, setToolCache]);

  return {
    data: cached || null,
    loading: loading && !cached,
    error,
    refetch: async () => {
      if (!rtl) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetcher(rtl);
        setToolCache(toolKey, data);
      } catch (err) {
        setError(normalizeError(err).message);
      } finally {
        setLoading(false);
      }
    },
  };
}

export default useLazyTool;
