import Card from "../ui/Card";
import CopyButton from "../ui/CopyButton";

function TestbenchCard({ testbench }) {
  if (!testbench) return null;

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Generated Testbench</h2>
        <CopyButton text={testbench} />
      </div>

      <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-sm text-slate-200">
        {testbench}
      </pre>
    </Card>
  );
}

export default TestbenchCard;
