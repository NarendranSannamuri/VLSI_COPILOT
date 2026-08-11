import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchSchematic, normalizeError } from "../../services/api";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import Card from "../ui/Card";
import ErrorBanner from "../ui/ErrorBanner";
import Button from "../ui/Button";
import { Download, Maximize2, Minimize2, Loader2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

function buildImageSource(response) {
  if (!response) return null;
  const raw = response.svg || response.schematic || response.image || response.diagram || response.data;
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (trimmed.startsWith("data:image") || trimmed.startsWith("data:svg") || trimmed.startsWith("data:image/svg+xml")) {
    return trimmed;
  }

  if (trimmed.startsWith("<svg")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`;
  }

  if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 100) {
    return `data:image/png;base64,${trimmed}`;
  }

  return null;
}

export default function SchematicPanel() {
  const { rtl, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSchematic() {
      if (!rtl) {
        if (mounted) setError("Upload RTL first to generate a schematic.");
        return;
      }

      if (cache.schematic) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetchSchematic(rtl);
        if (!mounted) return;
        setToolCache("schematic", response);
      } catch (err) {
        if (!mounted) return;
        setError(normalizeError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSchematic();

    return () => {
      mounted = false;
    };
  }, [cache.schematic, rtl, setToolCache]);

  const schematic = cache.schematic;
  const imageSrc = buildImageSource(schematic);
  const hasImage = Boolean(imageSrc);

  const downloadImage = () => {
    if (!hasImage) return;

    const extension = imageSrc.startsWith("data:image/svg") ? "svg" : "png";
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `schematic.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const controls = (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setZoom(1.0)} disabled={!hasImage}>
        <RefreshCw size={14} />
        Fit to Content
      </Button>
      <Button variant="secondary" onClick={() => setZoom((z) => Math.min(z + 0.2, 2.4))} disabled={!hasImage}>
        <ZoomIn size={14} />
        Zoom In
      </Button>
      <Button variant="secondary" onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))} disabled={!hasImage}>
        <ZoomOut size={14} />
        Zoom Out
      </Button>
      <Button variant="secondary" onClick={() => setFullscreen((value) => !value)} disabled={!hasImage}>
        {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        {fullscreen ? "Exit" : "Fullscreen"}
      </Button>
      <Button variant="secondary" onClick={downloadImage} disabled={!hasImage}>
        <Download size={14} />
        Download SVG
      </Button>
    </div>
  );

  const viewer = (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6" : "rounded-3xl border border-slate-800 bg-slate-950 p-4"}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Viewer</p>
          <h3 className="text-lg font-semibold text-white">Schematic Display</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
          {controls}
        </div>
      </div>
      <div className="relative max-h-[calc(100vh-12rem)] overflow-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 flex justify-center items-center" style={{ minHeight: fullscreen ? "calc(100vh - 10rem)" : "26rem" }}>
        <div className="inline-block origin-top transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
          <img
            src={imageSrc}
            alt="RTL schematic"
            className="block max-w-full rounded-2xl border border-slate-800 shadow-[0_20px_80px_rgba(15,23,42,0.45)]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      key="schematic"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Schematic</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Generated SVG Schematic Diagram</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Explore the compact logic schematic in a dark EDA-style viewer. Fit to content, zoom, fullscreen, and download SVG.
            </p>
          </div>
          {!fullscreen && controls}
        </div>
      </Card>

      {error && !loading && (
        <ErrorBanner message={error} onDismiss={() => setError("")} />
      )}

      {loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-slate-300">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
            <div>
              <p className="text-lg font-semibold text-white">Rendering schematic</p>
              <p className="mt-2 text-sm text-slate-400">Generating dynamic vector SVG schematic from shared logic graph...</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && rtl && (hasImage ? viewer : (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
          <p className="text-sm text-slate-400">The schematic could not be displayed. Please verify backend SVG generation.</p>
        </Card>
      ))}

      {!rtl && !loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No RTL loaded</p>
          <p className="mt-3 text-sm text-slate-400">Upload RTL before opening the Schematic page.</p>
        </Card>
      )}
    </motion.div>
  );
}
