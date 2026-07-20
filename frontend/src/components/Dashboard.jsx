import ScoreCard from "./results/ScoreCard";
import MetricsCard from "./results/MetricsCard";
import AIReviewCard from "./results/AIReviewCard";
import BugCard from "./results/BugCard";
import DownloadCard from "./results/DownloadCard";

function Dashboard({ result }) {

    return (

        <section className="mt-16">

            <div className="grid lg:grid-cols-2 gap-8">

                <ScoreCard
                    score={result.rtl_score.rtl_score}
                />

                <MetricsCard
                    metrics={result.metrics}
                />

            </div>

            <div className="mt-8">

                <AIReviewCard
                    review={result.ai_review}
                />

            </div>

            <div className="mt-8">

                <BugCard
                    bugs={result.bugs}
                />

            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">

                <DownloadCard/>

            </div>

        </section>

    );

}

export default Dashboard;