import {
  Bug,
  FileText,
  Gauge,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import Card from "./ui/Card";

const features = [
  {
    icon: ShieldCheck,
    title: "Syntax & Structure Checks",
    desc: "Catch missing modules, ports, and structural issues before synthesis.",
  },
  {
    icon: Bug,
    title: "RTL Bug Detection",
    desc: "AI flags latch risk, assignment misuse, and synthesis hazards.",
  },
  {
    icon: Sparkles,
    title: "AI Engineering Review",
    desc: "Strengths, issues, and recommendations from a senior-RTL prompt.",
  },
  {
    icon: Gauge,
    title: "Quality Score & Metrics",
    desc: "Score synthesizability and complexity at a glance.",
  },
  {
    icon: MessageSquare,
    title: "RTL Chat",
    desc: "Ask questions about your uploaded design in plain English.",
  },
  {
    icon: Wand2,
    title: "AI Optimizer",
    desc: "Improve readability and style while keeping behavior intact.",
  },
  {
    icon: GitBranch,
    title: "RTL Block Diagram",
    desc: "Interactive graph of inputs, gates, and outputs.",
  },
  {
    icon: FileText,
    title: "PDF Reports & Testbenches",
    desc: "Download engineering reports and auto-generated testbenches.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Engineering Workflow</h2>
        <p className="mt-3 text-slate-400">
          Everything an RTL engineer needs after the first upload.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="!p-5">
              <div className="mb-4 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2.5 text-cyan-300">
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-slate-100">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.desc}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default Features;
