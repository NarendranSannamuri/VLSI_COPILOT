import { Link, NavLink } from "react-router-dom";
import { Cpu } from "lucide-react";
import Button from "./ui/Button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/#tech", label: "Tech Stack" },
];

function Navbar({ variant = "landing" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold tracking-tight text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.25)] transition hover:border-cyan-400/30 hover:bg-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/15">
            <Cpu size={18} />
          </span>
          <span>VLSI Copilot</span>
        </Link>

        {variant === "landing" && (
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 transition hover:text-cyan-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {variant === "workspace" ? (
            <NavLink
              to="/"
              className="rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
            >
              Home
            </NavLink>
          ) : null}
          <Link to="/analyze">
            <Button className="!px-4 !py-2">{variant === "workspace" ? "New Analysis" : "Open Workspace"}</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
