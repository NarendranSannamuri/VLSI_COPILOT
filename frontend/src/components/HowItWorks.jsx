import Card from "./ui/Card";

const steps = [
  {
    step: "01",
    title: "Upload Verilog",
    desc: "Drop a .v or .sv file into the workspace.",
  },
  {
    step: "02",
    title: "Parse & Analyze",
    desc: "Regex parsing, metrics, graph, and syntax checks run first.",
  },
  {
    step: "03",
    title: "AI Review",
    desc: "Gemini scores quality, finds bugs, and writes an engineering review.",
  },
  {
    step: "04",
    title: "Iterate",
    desc: "Chat, optimize, generate a testbench, and download the PDF.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">How it Works</h2>
        <p className="mt-3 text-slate-400">From RTL upload to report in four steps.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <Card key={item.step} className="!p-5">
            <p className="font-mono text-sm text-cyan-300">{item.step}</p>
            <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
