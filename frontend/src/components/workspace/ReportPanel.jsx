import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createReport, downloadReportUrl, normalizeError } from "../../services/api";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import { Download, Loader2, FileText } from "lucide-react";

function buildReportPreview(response) {
  if (!response) return null;

  if (response.report_id || response.reportId || response.id) {
    return downloadReportUrl(response.report_id || response.reportId || response.id);
  }

  const raw = response.pdf || response.base64_pdf || response.pdf_data || response.document;
  if (!raw) return null;
  const base64 = String(raw).trim();
  if (base64.startsWith("data:application/pdf")) {
    return base64;
  }
  if (/^[A-Za-z0-9+/=\s]+$/.test(base64) && base64.length > 100) {
    return `data:application/pdf;base64,${base64}`;
  }
  return null;
}

export default function ReportPanel() {
  const { rtl, cache, setToolCache } = useRtlWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const report = cache.report || null;
  const reportUrl = useMemo(() => buildReportPreview(report), [report]);
  const reportId = report?.report_id || report?.reportId || report?.id || null;
  const generated = Boolean(reportUrl);

  const generateReport = async () => {
    if (!rtl) {
      setError("Upload RTL before generating a report.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await createReport(rtl);
      const preview = buildReportPreview(response);
      setToolCache("report", {
        ...response,
        previewUrl: preview,
      });
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!reportUrl) return;
    const url = reportUrl;

    if (url.startsWith("data:application/pdf")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = "vlsi-report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    window.open(url, "_blank");
  };

  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Engineering Report</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Generate your project PDF</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Create a consolidated report for RTL summary, metrics, bugs, and recommendations only when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateReport} disabled={loading || !rtl}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            <Button variant="secondary" onClick={downloadPdf} disabled={!generated}>
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-slate-300">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
            <div>
              <p className="text-lg font-semibold text-white">Generating report</p>
              <p className="mt-2 text-sm text-slate-400">Please wait while the PDF is compiled for your RTL design.</p>
            </div>
          </div>
        </Card>
      )}

      {generated && !loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Preview</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Report ready to download</h3>
              <p className="mt-3 text-sm text-slate-400">
                Review the report preview below. Use the download button for a PDF copy.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="font-semibold text-white">Report ID</div>
              <div>{reportId || "Local preview"}</div>
            </div>
          </div>

          <div className="mt-6 h-[70vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-inner">
            <iframe
              src={reportUrl}
              title="Report preview"
              className="h-full w-full"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </Card>
      )}

      {!rtl && !loading && (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No RTL loaded</p>
          <p className="mt-3 text-sm text-slate-400">Upload RTL first and return to the dashboard before generating a report.</p>
        </Card>
      )}
    </motion.div>
  );
}
