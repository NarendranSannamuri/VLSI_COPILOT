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