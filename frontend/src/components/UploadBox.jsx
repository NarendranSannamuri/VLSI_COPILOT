import { useState, useEffect } from "react";
import api from "../services/api";
import Dashboard from "./Dashboard";

function UploadBox({ user, onUnlockClick }) {
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);
    const [verilogText, setVerilogText] = useState("");
    const [loading, setLoading] = useState(false);

    // Supporting both file upload and code pasting
    const [uploadMode, setUploadMode] = useState("file"); // "file" or "paste"
    const [pastedFilename, setPastedFilename] = useState("untitled.v");
    const [pastedCode, setPastedCode] = useState("");

    const uploadRTL = async (fileToUpload) => {
        const formData = new FormData();
        formData.append("file", fileToUpload);

        try {
            setLoading(true);

            // Read verilog text from file to store locally in state
            const reader = new FileReader();
            reader.onload = (e) => {
                setVerilogText(e.target.result);
            };
            reader.readAsText(fileToUpload);

            const response = await api.post("/upload", formData);
            setResult(response.data);
            console.log(response.data);

            alert("RTL Analysis Complete!");
        } catch (error) {
            console.log(error);
            alert("Upload Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (uploadMode === "file") {
            if (!file) {
                alert("Please choose a Verilog file.");
                return;
            }
            await uploadRTL(file);
        } else {
            if (!pastedCode.trim()) {
                alert("Please paste your Verilog/SystemVerilog code.");
                return;
            }
            if (!pastedFilename.trim()) {
                alert("Please specify a filename.");
                return;
            }

            // Create a virtual file from the pasted code
            const blob = new Blob([pastedCode], { type: "text/plain" });
            const virtualFile = new File([blob], pastedFilename.trim(), { type: "text/plain" });

            setFile(virtualFile);
            setVerilogText(pastedCode);

            await uploadRTL(virtualFile);
        }
    };

    // Watch for login and instantly fetch premium results to preserve session!
    useEffect(() => {
        const unlockPremiumContent = async () => {
            // Only proceed if user is logged in, verilogText is loaded, and result was previously locked
            if (user && verilogText && result && result.block_diagram_svg === null) {
                try {
                    setLoading(true);
                    const reqPayload = { verilog_code: verilogText, filename: file?.name || "design.v" };

                    const [diagramsRes, metricsRes, bugsRes, aiRes, tbRes, reportRes] = await Promise.all([
                        api.post("/premium/diagrams", reqPayload),
                        api.post("/premium/metrics", reqPayload),
                        api.post("/premium/bugs", reqPayload),
                        api.post("/premium/ai-review", reqPayload),
                        api.post("/premium/testbench", reqPayload),
                        api.post("/premium/generate-report", reqPayload)
                    ]);

                    setResult((prev) => ({
                        ...prev,
                        block_diagram_svg: diagramsRes.data.block_diagram_svg,
                        schematic_diagram_svg: diagramsRes.data.schematic_diagram_svg,
                        metrics: metricsRes.data.metrics,
                        bugs: bugsRes.data.bugs,
                        ai_review: aiRes.data.ai_review,
                        rtl_score: aiRes.data.rtl_score,
                        testbench: tbRes.data.testbench,
                        pdf_report: reportRes.data.pdf_report
                    }));
                } catch (err) {
                    console.error("Failed to automatically unlock premium content:", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        unlockPremiumContent();
    }, [user, verilogText]);

    return (
        <section className="flex justify-center mt-12 mb-16">
            <div className="w-[760px] bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl">
                <h2 className="text-3xl font-semibold text-center">
                    Upload RTL Design
                </h2>

                <p className="text-slate-400 text-center mt-3">
                    Upload your Verilog (.v / .sv) file or paste source code for AI analysis
                </p>

                {/* Tabs to switch modes */}
                <div className="flex justify-center mt-8 gap-4">
                    <button
                        onClick={() => { setUploadMode("file"); setResult(null); }}
                        className={`px-5 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                            uploadMode === "file"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Upload .v / .sv File
                    </button>
                    <button
                        onClick={() => { setUploadMode("paste"); setResult(null); }}
                        className={`px-5 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                            uploadMode === "paste"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        Paste Verilog Code
                    </button>
                </div>

                {uploadMode === "file" ? (
                    <div className="mt-8 border-2 border-dashed border-slate-700 rounded-2xl p-14 text-center">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="text-slate-400"
                        />

                        {file && (
                            <p className="mt-5 text-green-400 font-medium">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col gap-5 text-left">
                        <div>
                            <label className="text-slate-300 text-sm font-semibold block mb-2">
                                Filename
                            </label>
                            <input
                                type="text"
                                value={pastedFilename}
                                onChange={(e) => setPastedFilename(e.target.value)}
                                placeholder="untitled.v"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500 font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-semibold block mb-2">
                                Verilog / SystemVerilog Source Code
                            </label>
                            <textarea
                                value={pastedCode}
                                onChange={(e) => setPastedCode(e.target.value)}
                                placeholder="// Paste your Verilog or SystemVerilog code here...&#10;module full_adder(&#10;    input a, b, cin,&#10;    output sum, cout&#10;);"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 outline-none focus:border-blue-500 font-mono text-sm h-72 resize-y"
                            />
                        </div>
                    </div>
                )}

                <div className="text-center mt-8">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 transition px-8 py-3.5 rounded-xl cursor-pointer font-bold text-white shadow-lg shadow-blue-500/10"
                    >
                        {loading ? "Analyzing RTL..." : "Analyze RTL"}
                    </button>
                </div>

                {result && (
                    <Dashboard
                        result={result}
                        user={user}
                        onUnlockClick={onUnlockClick}
                    />
                )}
            </div>
        </section>
    );
}

export default UploadBox;
