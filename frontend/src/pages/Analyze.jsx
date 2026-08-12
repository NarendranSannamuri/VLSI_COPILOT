import { useRef } from "react";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import Dashboard from "../components/Dashboard";
import EmptyState from "../components/ui/EmptyState";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import ErrorBanner from "../components/ui/ErrorBanner";
import useRtlAnalysis from "../hooks/useRtlAnalysis";

function Analyze() {
  const dashboardRef = useRef(null);
  const { result, loading, error, status, analyze, setError } = useRtlAnalysis();

  const handleAnalyze = async (file) => {
    const data = await analyze(file);
    if (data) {
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar variant="workspace" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            RTL Analysis Workspace
          </h1>
          <p className="mt-2 text-slate-400">
            Upload Verilog to run parsing, AI review, scoring, and report generation.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
          </div>
        )}

        <UploadBox
          loading={loading}
          status={status}
          onAnalyze={handleAnalyze}
        />

        <div ref={dashboardRef} className="mt-10">
          {loading && <DashboardSkeleton />}
          {!loading && !result && (
            <EmptyState
              title="No analysis yet"
              description="Choose a .v or .sv file and click Analyze RTL to populate your dashboard."
            />
          )}
          {!loading && result && <Dashboard result={result} />}
        </div>
      </main>
    </div>
  );
}

export default Analyze;
