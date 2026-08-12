import { Activity, Boxes, CircuitBoard, Shield } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

function DesignSummary({ result }) {
  const syntaxErrors = result.syntax_errors || [];
  const warnings = result.warnings || [];

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Design Summary</h2>
        <Badge tone={result.rtl_score?.synthesizable ? "success" : "warning"}>
          {result.rtl_score?.synthesizable ? "Synthesizable" : "Review synthesizability"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Module",
            value: result.analysis?.module_name || "Unknown",
            icon: CircuitBoard,
          },
          {
            label: "Design Type",
            value: result.metrics?.design_type || "Unknown",
            icon: Boxes,
          },
          {
            label: "Complexity",
            value: result.metrics?.module_complexity || "Unknown",
            icon: Activity,
          },
          {
            label: "Synthesizable",
            value: result.rtl_score?.synthesizable ? "YES" : "NO",
            icon: Shield,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <Icon size={14} />
                <span className="text-xs uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="truncate text-lg font-semibold text-slate-100">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {syntaxErrors.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-red-300">Syntax Errors</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {syntaxErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-amber-300">Design Warnings</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default DesignSummary;
