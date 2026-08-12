import Card from "../ui/Card";
import Badge from "../ui/Badge";

function BugCard({ bugs }) {
  if (!bugs) return null;

  const tone =
    bugs.severity === "High"
      ? "danger"
      : bugs.severity === "Medium"
        ? "warning"
        : "success";

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Bug Detection</h2>
        <Badge tone={tone}>{bugs.severity || "Unknown"}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Bug Type", bugs.bug_type],
          ["Line", bugs.line],
          ["Reason", bugs.reason],
          ["Recommendation", bugs.recommendation],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default BugCard;
