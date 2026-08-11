import { useState, useEffect } from "react";
import api from "../services/api";
import Dashboard from "./Dashboard";

function UploadBox({ user, onUnlockClick }) {
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);
    const [verilogText, setVerilogText] = useState("");
    const [loading, setLoading] = useState(false);

    const uploadRTL = async () => {
        if (!file) {
            alert("Please choose a Verilog file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            // Read verilog text from file to store locally in state
            const reader = new FileReader();
            reader.onload = (e) => {
                setVerilogText(e.target.result);
            };
            reader.readAsText(file);

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
        <section className="flex justify-center mt-12">
            <div className="w-[760px] bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl">
                <h2 className="text-3xl font-semibold text-center">
                    Upload RTL Design
                </h2>

                <p className="text-slate-400 text-center mt-3">
                    Upload your Verilog (.v / .sv) design for AI analysis
                </p>

                <div className="mt-10 border-2 border-dashed border-slate-700 rounded-2xl p-14 text-center">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    {file && (
                        <p className="mt-5 text-green-400">
                            Selected:
                            <br />
                            {file.name}
                        </p>
                    )}

                    <button
                        onClick={uploadRTL}
                        disabled={loading}
                        className="mt-8 bg-blue-600 hover:bg-blue-700 transition px-8 py-3 rounded-xl cursor-pointer font-bold text-white shadow-lg shadow-blue-500/10"
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
