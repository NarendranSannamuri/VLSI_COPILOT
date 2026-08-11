import Card from "../ui/Card";

function MetricsCard({ metrics }) {
  if (!metrics) return null;

  const rows = [
    ["Inputs", metrics.inputs],
    ["Outputs", metrics.outputs],
    ["Assignments", metrics.assignments],
    ["Complexity", metrics.module_complexity],
    ["Type", metrics.design_type],
  ];

  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">Design Metrics</h2>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
          >
            <span className="text-sm text-slate-400">{label}</span>
            <span className="font-medium text-slate-100">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default MetricsCard;
