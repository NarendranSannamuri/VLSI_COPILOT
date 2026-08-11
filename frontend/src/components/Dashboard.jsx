import React from "react";
import { Lock } from "lucide-react";
import ScoreCard from "./results/ScoreCard";
import MetricsCard from "./results/MetricsCard";
import AIReviewCard from "./results/AIReviewCard";
import BugCard from "./results/BugCard";
import DownloadCard from "./results/DownloadCard";
import TestbenchCard from "./results/TestbenchCard";

function LockedCard({ title, onUnlockClick }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-lg relative overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center">
            {/* Blur effect */}
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-blue-600/10 text-blue-400 p-3 rounded-full border border-blue-500/20 mb-3">
                    <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1">
                    {title} is Locked
                </h3>
                <p className="text-slate-400 text-xs max-w-sm mb-4 leading-relaxed">
                    Create a free account or log in to instantly view interactive schematic graphics, automated timing/complexity metrics, and AI design summaries.
                </p>
                <button
                    onClick={onUnlockClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                    Unlock Feature
                </button>
            </div>
        </div>
    );
}

function Dashboard({ result, user, onUnlockClick }) {
    const isGuest = !user;

    return (
        <section className="mt-16 space-y-8">

            {/* UNLOCKED SECTION FOR GUESTS: RTL Explorer & RTL Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-800 pb-4">
                    RTL Explorer & Free Structural Analysis
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* RTL Explorer */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-400">RTL Port Explorer</h3>
                        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 font-mono text-sm space-y-3">
                            <div>
                                <span className="text-slate-400 block text-xs uppercase tracking-wider font-semibold mb-1">Module Name</span>
                                <span className="text-white font-bold">{result.parsed_data?.module_name || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs uppercase tracking-wider font-semibold mb-1">Input Ports</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {result.parsed_data?.inputs?.length > 0 ? (
                                        result.parsed_data.inputs.map((inp) => (
                                            <span key={inp} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 text-xs">{inp}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-xs italic">No input ports found</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs uppercase tracking-wider font-semibold mb-1">Output Ports</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {result.parsed_data?.outputs?.length > 0 ? (
                                        result.parsed_data.outputs.map((out) => (
                                            <span key={out} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 text-xs">{out}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-xs italic">No output ports found</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RTL Analysis Warnings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-emerald-400">RTL Lint & Warning Analysis</h3>
                        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                            {result.syntax_errors?.length > 0 && (
                                <div>
                                    <span className="text-red-400 font-semibold text-xs uppercase tracking-wider block mb-2">Syntax Errors Detected</span>
                                    <ul className="list-disc pl-5 text-slate-300 text-xs space-y-1">
                                        {result.syntax_errors.map((err, i) => (
                                            <li key={i} className="text-red-300">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block mb-2">Structural Warnings</span>
                                <ul className="list-disc pl-5 text-slate-300 text-xs space-y-1">
                                    {result.warnings?.length > 0 ? (
                                        result.warnings.map((warn, i) => (
                                            <li key={i} className={warn.includes("No structural issues") ? "text-emerald-400" : "text-yellow-400"}>
                                                {warn}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-500 italic">No structural issues analyzed.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score + Metrics (Auth Guarded) */}
            <div className="grid lg:grid-cols-2 gap-8">
                {isGuest ? (
                    <>
                        <LockedCard title="RTL Quality Score" onUnlockClick={onUnlockClick} />
                        <LockedCard title="Design Metrics" onUnlockClick={onUnlockClick} />
                    </>
                ) : (
                    <>
                        <ScoreCard score={result.rtl_score?.rtl_score || 0} />
                        <MetricsCard metrics={result.metrics} />
                    </>
                )}
            </div>

            {/* Design Visualizations (Auth Guarded) */}
            <div className="space-y-8">
                {isGuest ? (
                    <>
                        <LockedCard title="Top-Level Architecture Block Diagram" onUnlockClick={onUnlockClick} />
                        <LockedCard title="Gate-Level Logic Schematic Diagram" onUnlockClick={onUnlockClick} />
                    </>
                ) : (
                    <>
                        {result.block_diagram_svg && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                                <h2 className="text-2xl font-semibold mb-2 text-blue-400">
                                    Top-Level Architecture Block Diagram
                                </h2>
                                <p className="text-slate-400 mb-6 text-sm">
                                    Derived architectural interface block showing input ports, core module boundaries, and output ports.
                                </p>
                                <div
                                    className="bg-slate-950 rounded-xl p-6 border border-slate-800 overflow-x-auto flex justify-center items-center"
                                    dangerouslySetInnerHTML={{ __html: result.block_diagram_svg }}
                                />
                            </div>
                        )}

                        {result.schematic_diagram_svg && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">
                                <h2 className="text-2xl font-semibold mb-2 text-emerald-400">
                                    Gate-Level Logic Schematic Diagram
                                </h2>
                                <p className="text-slate-400 mb-6 text-sm">
                                    Reconstructed combinational gate network mapped topologically from left to right using actual RTL signal names.
                                </p>
                                <div
                                    className="bg-slate-950 rounded-xl p-6 border border-slate-800 overflow-x-auto flex justify-center items-center"
                                    dangerouslySetInnerHTML={{ __html: result.schematic_diagram_svg }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* AI Review (Auth Guarded) */}
            {isGuest ? (
                <LockedCard title="AI Engineering Review" onUnlockClick={onUnlockClick} />
            ) : (
                <AIReviewCard review={result.ai_review} />
            )}

            {/* Bug Detection (Auth Guarded) */}
            {isGuest ? (
                <LockedCard title="AI Bug Detection & Diagnostics" onUnlockClick={onUnlockClick} />
            ) : (
                <BugCard bugs={result.bugs} />
            )}

            {/* Generated Testbench (Auth Guarded) */}
            {isGuest ? (
                <LockedCard title="Automated Testbench Generator" onUnlockClick={onUnlockClick} />
            ) : (
                <TestbenchCard testbench={result.testbench} />
            )}

            {/* Download Report (Auth Guarded) */}
            {isGuest ? (
                <LockedCard title="Comprehensive PDF Engineering Report Download" onUnlockClick={onUnlockClick} />
            ) : (
                <DownloadCard />
            )}

        </section>
    );
}

export default Dashboard;
