import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { FileCode2, Sparkles } from "lucide-react";
import DesignSummary from "./results/DesignSummary";
import ScoreCard from "./results/ScoreCard";
import MetricsCard from "./results/MetricsCard";
import AIReviewCard from "./results/AIReviewCard";
import BugCard from "./results/BugCard";
import DownloadCard from "./results/DownloadCard";
import TestbenchCard from "./results/TestbenchCard";
import Card from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";

const RTLCodeViewer = lazy(() => import("./results/RTLCodeViewer"));
const RTLChat = lazy(() => import("./results/RTLChat"));
const OptimizeCard = lazy(() => import("./results/OptimizeCard"));
const RTLDiagram = lazy(() => import("./RTLDiagram"));

function LazyFallback({ height = "h-64" }) {
  return <Skeleton className={`${height} w-full`} />;
}

function Dashboard({ result }) {
  const code = result?.verilog_text || result?.verilog_code || "";
  const score = result?.rtl_score?.rtl_score ?? 0;

  // If this dashboard was created only from an uploaded file (no analysis run),
  // show a minimal view and avoid rendering cards that might assume backend data.
  if (result?.localOnly) {
    return (
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6 animate-fade-up">
        <Card hover={false} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-950/80 p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                <Sparkles size={14} />
                Ready for analysis
              </div>
              <h2 className="text-2xl font-semibold text-white">Uploaded RTL workspace</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                {result.filename || "Untitled"} is currently available in the workspace. Open any tool on the sidebar to run analysis, inspect the RTL, or generate outputs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Source length</div>
              <div className="mt-1 font-semibold text-slate-100">{code.length || 0} characters</div>
            </div>
          </div>
        </Card>

        <Suspense fallback={<LazyFallback height="h-80" />}>
          <RTLCodeViewer code={code} />
        </Suspense>

        <Card hover={false} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-950/80 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
              <FileCode2 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Next step</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                No analysis has been run yet. Use the workspace tools to inspect structure, measure quality, generate a testbench, and create a report whenever you are ready.
              </p>
            </div>
          </div>
        </Card>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6 animate-fade-up">
      <DesignSummary result={result} />

      <Suspense fallback={<LazyFallback height="h-80" />}>
        <RTLCodeViewer code={code} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreCard score={score} rtlScore={result.rtl_score} />
        <MetricsCard metrics={result.metrics} />
      </div>

      <AIReviewCard review={result.ai_review} />
      <BugCard bugs={result.bugs} />
      <TestbenchCard testbench={result.testbench} />

      <Suspense fallback={<LazyFallback height="h-96" />}>
        <RTLChat rtl={code} />
      </Suspense>

      <Suspense fallback={<LazyFallback height="h-96" />}>
        <OptimizeCard rtl={code} />
      </Suspense>

      <DownloadCard reportId={result.report_id} />

      {result.rtl_graph && (
        <Suspense fallback={<LazyFallback height="h-[32rem]" />}>
          <RTLDiagram graph={result.rtl_graph} />
        </Suspense>
      )}
    </motion.section>
  );
}

export default Dashboard;
