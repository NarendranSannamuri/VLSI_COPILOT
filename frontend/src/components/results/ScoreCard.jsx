import React from "react";

function ScoreCard({ score }) {
    if (score === undefined || score === null) {
        return (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex items-center justify-center text-slate-400 text-sm italic min-h-[200px]">
                Calculating quality score...
            </div>
        );
    }

    const color =
        score >= 90
            ? "text-green-400"
            : score >= 70
            ? "text-yellow-400"
            : "text-red-400";

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <h2 className="text-xl font-semibold mb-6">
                RTL Quality Score
            </h2>

            <div className={`text-7xl font-bold ${color}`}>
                {score}/100
            </div>
        </div>
    );
}

export default ScoreCard;
