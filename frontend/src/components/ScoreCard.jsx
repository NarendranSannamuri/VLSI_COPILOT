function ScoreCard({ score }) {

    const color =
        score >= 90
            ? "text-green-400"
            : score >= 70
            ? "text-yellow-400"
            : "text-red-400";

    const status =
        score >= 90
            ? "Excellent RTL Design"
            : score >= 70
            ? "Good RTL Design"
            : "Needs Improvement";

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">

            <h2 className="text-xl font-semibold text-slate-200">
                RTL Quality Score
            </h2>

            <div className={`mt-8 text-7xl font-bold ${color}`}>
                {score}/100
            </div>

            <p className="mt-5 text-lg text-slate-400">
                {status}
            </p>

        </div>

    );

}

export default ScoreCard;