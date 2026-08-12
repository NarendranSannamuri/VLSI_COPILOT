import { useCallback, useState } from "react";
import { normalizeError, uploadRtl } from "../services/api";

export function useRtlAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const analyze = useCallback(async (file) => {
    if (!file) {
      setError("Please choose a Verilog file.");
      return null;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setStatus("Uploading RTL...");

    try {
      setStatus("Running AI analysis...");
      const data = await uploadRtl(file);
      setResult(data);
      setStatus("Analysis complete");
      return data;
    } catch (err) {
      const normalized = normalizeError(err);
      setError(normalized.message);
      setStatus("Upload failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError("");
    setStatus("");
  }, []);

  return { result, loading, error, status, analyze, reset, setError };
}

export default useRtlAnalysis;
