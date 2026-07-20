import { useState } from "react";
import api from "../services/api";
import Dashboard from "./Dashboard";

function UploadBox() {
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);
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
                        className="mt-8 bg-blue-600 hover:bg-blue-700 transition px-8 py-3 rounded-xl"
                    >
                        {loading ? "Analyzing RTL..." : "Analyze RTL"}
                    </button>
                </div>

                {result && <Dashboard result={result} />}
            </div>
        </section>
    );
}

export default UploadBox;