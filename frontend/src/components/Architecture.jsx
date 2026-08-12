import Card from "./ui/Card";

function Architecture() {
  return (
    <section id="architecture" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Architecture</h2>
        <p className="mt-3 text-slate-400">
          React workspace talking to a FastAPI analysis and AI pipeline.
        </p>
      </div>

      <Card className="overflow-x-auto !p-6 md:!p-10">
        <div className="mx-auto flex min-w-[640px] max-w-4xl flex-col items-center gap-4">
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200">
            React Dashboard (Vite + Tailwind)
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-cyan-400/60 to-slate-600" />
          <div className="rounded-xl border border-slate-600 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200">
            FastAPI · /upload · /chat · /optimize · /download-report
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-slate-600 to-slate-700" />
          <div className="grid w-full grid-cols-3 gap-3">
            {[
              "Parsers & Analyzers",
              "Gemini AI Layer",
              "PDF · Testbench · Graph",
            ].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-4 text-center text-xs font-medium text-slate-300 md:text-sm"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

export default Architecture;
