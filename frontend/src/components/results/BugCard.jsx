function BugCard({ bugs }) {
    if (!bugs || bugs.severity === "None" || bugs.severity === "No RTL Bugs") {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">
                    RTL Bug Detection & Diagnostics
                </h2>
                <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-6 text-emerald-300">
                    <p className="font-semibold text-lg mb-1">✓ No design errors detected</p>
                    <p className="text-sm text-emerald-400/80">
                        The Verilog design passed all linting and structural bug detection rules. No latches, multiple drivers, or combinational loops were found.
                    </p>
                </div>
            </div>
        );
    }

    const severityColor =
        bugs.severity === "High"
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : bugs.severity === "Medium"
            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
            : "bg-blue-500/10 text-blue-400 border border-blue-500/30";

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">
                RTL Bug Detection & Diagnostics
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-medium">Severity:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColor}`}>
                            {bugs.severity}
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium block mb-1">Bug Type / Category:</span>
                        <span className="text-white font-semibold text-lg">{bugs.bug_type}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium block mb-1">Source Line Reference:</span>
                        <span className="text-white font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            Line {bugs.line || "-"}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-slate-400 font-medium block mb-1">Failure Mechanism (Reason):</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{bugs.reason}</p>
                    </div>

                    <div>
                        <span className="text-emerald-400 font-medium block mb-1">Actionable Recommendation:</span>
                        <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg">
                            {bugs.recommendation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BugCard;
