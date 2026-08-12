import Badge from "./ui/Badge";
import Card from "./ui/Card";

const stack = [
  "Python",
  "FastAPI",
  "Gemini",
  "ReportLab",
  "React 19",
  "Vite",
  "Tailwind CSS",
  "React Flow",
  "Axios",
  "Framer Motion",
];

function TechStack() {
  return (
    <section id="tech" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Tech Stack</h2>
        <p className="mt-3 text-slate-400">Modern, deployable, and recruiter-readable.</p>
      </div>

      <Card>
        <div className="flex flex-wrap justify-center gap-3">
          {stack.map((item) => (
            <Badge key={item} tone="accent" className="!px-3 !py-1.5 !text-sm">
              {item}
            </Badge>
          ))}
        </div>
      </Card>
    </section>
  );
}

export default TechStack;
