import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Badge tone="accent" className="mb-6 gap-1.5">
            <Sparkles size={12} />
            AI-Powered RTL Engineering
          </Badge>

          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl">
            <span className="block text-slate-100">VLSI Copilot</span>
            <span className="mt-3 block text-gradient text-3xl md:text-5xl">
              Your RTL Engineering Assistant
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Upload Verilog, detect bugs, score quality, chat with your design,
            optimize RTL, and download professional engineering reports — in one workspace.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/analyze">
              <Button className="!px-7 !py-3">
                Start Analyzing
                <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" className="!px-7 !py-3">
                Explore Features
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
