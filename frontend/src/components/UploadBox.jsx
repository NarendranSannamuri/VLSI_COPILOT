import { UploadCloud } from "lucide-react";

function UploadCard() {
  return (
    <section className="flex justify-center mt-10">

      <div className="w-[750px] bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">

        <h2 className="text-3xl font-semibold text-center">
          Upload RTL Design
        </h2>

        <p className="text-slate-400 text-center mt-3">
          Analyze Verilog (.v / .sv) files using AI
        </p>

        <div className="mt-10 border-2 border-dashed border-slate-700 rounded-2xl p-16 flex flex-col items-center">

          <UploadCloud
            size={70}
            className="text-blue-500"
          />

          <h3 className="mt-6 text-xl font-semibold">
            Drag & Drop RTL File
          </h3>

          <p className="text-slate-400 mt-3">
            or
          </p>

          <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition">
            Browse Files
          </button>

        </div>

      </div>

    </section>
  );
}

export default UploadCard;