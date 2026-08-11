import ScoreCard from "./results/ScoreCard";
import MetricsCard from "./results/MetricsCard";
import AIReviewCard from "./results/AIReviewCard";
import BugCard from "./results/BugCard";
import DownloadCard from "./results/DownloadCard";
import TestbenchCard from "./results/TestbenchCard";

function Dashboard({ result }) {

    return (

        <section className="mt-16 space-y-8">

            {/* Score + Metrics */}

            <div className="grid lg:grid-cols-2 gap-8">

                <ScoreCard
                    score={result.rtl_score.rtl_score}
                />

                <MetricsCard
                    metrics={result.metrics}
                />

            </div>

            {/* Design Visualizations */}
            <div className="space-y-8">
                {result.block_diagram_svg && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-semibold mb-2 text-blue-400">
                            Top-Level Architecture Block Diagram
                        </h2>
                        <p className="text-slate-400 mb-6 text-sm">
                            Derived architectural interface block showing input ports, core module boundaries, and output ports.
                        </p>
                        <div
                            className="bg-slate-950 rounded-xl p-6 border border-slate-800 overflow-x-auto flex justify-center items-center"
                            dangerouslySetInnerHTML={{ __html: result.block_diagram_svg }}
                        />
                    </div>
                )}

                {result.schematic_diagram_svg && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-semibold mb-2 text-emerald-400">
                            Gate-Level Logic Schematic Diagram
                        </h2>
                        <p className="text-slate-400 mb-6 text-sm">
                            Reconstructed combinational gate network mapped topologically from left to right using actual RTL signal names.
                        </p>
                        <div
                            className="bg-slate-950 rounded-xl p-6 border border-slate-800 overflow-x-auto flex justify-center items-center"
                            dangerouslySetInnerHTML={{ __html: result.schematic_diagram_svg }}
                        />
                    </div>
                )}
            </div>

            {/* AI Review */}

            <AIReviewCard
                review={result.ai_review}
            />

            {/* Bug Detection */}

            <BugCard
                bugs={result.bugs}
            />

            {/* Generated Testbench */}

            <TestbenchCard
                testbench={result.testbench}
            />

            {/* Download Report */}

            <DownloadCard />

        </section>

    );

}

export default Dashboard;