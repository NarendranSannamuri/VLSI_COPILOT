import { useState } from "react";
import { CheckCircle2, FileCode2, Loader2, Upload } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

function UploadBox({ loading, status, onAnalyze }) {
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      setLocalError("Please choose a Verilog (.v / .sv) file.");
      return;
    }
    setLocalError("");
    await onAnalyze?.(file);
  };

  return (
    <Card hover={false} className="sticky top-[72px] z-20 !p-6 md:!p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            <Upload size={14} />
            RTL intake
          </div>
          <h2 className="text-xl font-semibold text-white">Upload RTL Design</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Accepts Verilog and SystemVerilog source files and prepares them for the full EDA workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            id="rtl-upload"
            type="file"
            accept=".v,.sv"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setLocalError("");
            }}
          />

          <label
            htmlFor="rtl-upload"
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-600 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/40"
          >
            <Upload size={16} />
            Choose file
          </label>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze RTL"
            )}
          </Button>
        </div>
      </div>

      {file && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <FileCode2 size={16} />
          Selected: {file.name}
        </div>
      )}

      {localError && (
        <p className="mt-4 text-sm text-red-300">{localError}</p>
      )}

      {loading && (
        <div className="mt-5 rounded-[1.25rem] border border-cyan-500/20 bg-cyan-500/5 px-4 py-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-cyan-300">{status || "Analyzing RTL..."}</span>
            <span className="text-slate-500">AI pipeline</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 to-sky-400" />
          </div>
        </div>
      )}

      {!loading && status === "Analysis complete" && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} />
          Analysis complete — dashboard updated below.
        </div>
      )}
    </Card>
  );
}

export default UploadBox;
