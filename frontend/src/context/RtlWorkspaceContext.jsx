import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { normalizeError } from "../services/api";

const RtlWorkspaceContext = createContext(null);

export function RtlWorkspaceProvider({ children }) {
  const [filename, setFilename] = useState("");
  const [rtl, setRtl] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [activeTool, setActiveTool] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cache, setCache] = useState({});

  const clearWorkspace = useCallback(() => {
    setFilename("");
    setRtl("");
    setParsedData(null);
    setSyntaxErrors([]);
    setActiveTool("overview");
    setUploadError("");
    setCache({});
  }, []);

  const loadFile = useCallback(async (file) => {
    // Read the file locally and store it in context. Do not call backend analysis
    setUploading(true);
    setUploadError("");
    try {
      const content = await file.text();
      setFilename(file.name || "");
      setRtl(content || "");
      // Clear any analysis-derived state — analysis should be requested explicitly by the user
      setParsedData(null);
      setSyntaxErrors([]);
      setCache({});
      setActiveTool("overview");
      // Return a minimal result-like object for compatibility if callers expect it
      const localResult = { filename: file.name, verilog_text: content, localOnly: true };
      return localResult;
    } catch (err) {
      const normalized = normalizeError(err);
      setUploadError(normalized.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const setToolCache = useCallback((key, value) => {
    setCache((prev) => ({ ...prev, [key]: value }));
  }, []);

  const value = useMemo(
    () => ({
      filename,
      rtl,
      parsedData,
      syntaxErrors,
      activeTool,
      setActiveTool,
      uploading,
      uploadError,
      setUploadError,
      loadFile,
      clearWorkspace,
      cache,
      setToolCache,
      hasRtl: Boolean(rtl),
    }),
    [
      filename,
      rtl,
      parsedData,
      syntaxErrors,
      activeTool,
      uploading,
      uploadError,
      loadFile,
      clearWorkspace,
      cache,
      setToolCache,
    ]
  );

  return (
    <RtlWorkspaceContext.Provider value={value}>
      {children}
    </RtlWorkspaceContext.Provider>
  );
}

export function useRtlWorkspace() {
  const ctx = useContext(RtlWorkspaceContext);
  if (!ctx) {
    throw new Error("useRtlWorkspace must be used within RtlWorkspaceProvider");
  }
  return ctx;
}

export default RtlWorkspaceContext;
