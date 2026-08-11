import { lazy, Suspense } from "react";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import { Skeleton } from "../ui/Skeleton";
import { AnimatePresence, motion } from "framer-motion";

const OverviewPanel = lazy(() => import("./OverviewPanel"));
const ExplorerPanel = lazy(() => import("./ExplorerPanel"));
const AnalysisPanel = lazy(() => import("./AnalysisPanel"));
const DiagramPanel = lazy(() => import("./DiagramPanel"));
const SchematicPanel = lazy(() => import("./SchematicPanel"));
const MetricsPanel = lazy(() => import("./MetricsPanel"));
const BugsPanel = lazy(() => import("./BugsPanel"));
const OptimizePanel = lazy(() => import("./OptimizePanel"));
const TestbenchPanel = lazy(() => import("./TestbenchPanel"));
const ChatPanel = lazy(() => import("./ChatPanel"));
const ReportPanel = lazy(() => import("./ReportPanel"));

const PANELS = {
  overview: OverviewPanel,
  explorer: ExplorerPanel,
  analysis: AnalysisPanel,
  diagram: DiagramPanel,
  schematic: SchematicPanel,
  metrics: MetricsPanel,
  bugs: BugsPanel,
  optimize: OptimizePanel,
  testbench: TestbenchPanel,
  chat: ChatPanel,
  report: ReportPanel,
};

function WorkspaceCanvas() {
  const { activeTool } = useRtlWorkspace();
  const Panel = PANELS[activeTool] || OverviewPanel;

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-72 w-full" />
          </div>
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22 }}
            className="min-h-full"
          >
            <Panel />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </main>
  );
}

export default WorkspaceCanvas;
