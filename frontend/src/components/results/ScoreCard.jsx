import Card from "../ui/Card";
import Badge from "../ui/Badge";

function ScoreCard({ score = 0, rtlScore }) {
  const color =
    score >= 90 ? "text-emerald-300" : score >= 70 ? "text-amber-300" : "text-red-300";
  const tone = score >= 90 ? "success" : score >= 70 ? "warning" : "danger";
  const status =
    score >= 90
      ? "Excellent RTL Design"
      : score >= 70
        ? "Good RTL Design"
        : "Needs Improvement";

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">RTL Quality Score</h2>
        <Badge tone={tone}>{status}</Badge>
      </div>

      <div className={`text-7xl font-bold tracking-tight ${color}`}>
        {score}
        <span className="text-3xl text-slate-500">/100</span>
      </div>

      {rtlScore?.summary && (
        <p className="mt-5 text-sm leading-relaxed text-slate-400">
          {rtlScore.summary}
        </p>
      )}
    </Card>
  );
}

export default ScoreCard;
