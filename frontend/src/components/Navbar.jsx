import { Link, NavLink } from "react-router-dom";
import React from "react";
import Button from "./ui/Button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/#tech", label: "Tech Stack" },
];

function Navbar({ variant = "landing", user, onLogout, onLoginClick, onSignupClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold tracking-tight text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.25)] transition hover:border-cyan-400/30 hover:bg-slate-900">
          {/* Custom SVG Logo */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 select-none" fill="none">
            <g stroke="#64748b" stroke-width="2" stroke-linecap="round">
              <path d="M2 10h4M2 16h4M2 22h4" />
              <path d="M26 10h4M26 16h4M26 22h4" />
              <path d="M12 2v4M20 2v4" />
              <path d="M12 26v4M20 26v4" />
            </g>
            <rect x="6" y="6" width="20" height="20" rx="3" fill="#0f172a" stroke="#0ea5e9" stroke-width="2" />
            <path d="M10 10l6 10" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M22 10l-6 10" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16 20v3" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="16" cy="20" r="2.2" fill="#c084fc" />
          </svg>
          <span className="font-bold tracking-wide">VLSI Copilot</span>
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

        <div className="ml-auto flex items-center gap-4">
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

          {/* Authentication State Buttons */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              <span className="hidden sm:inline text-slate-400 text-xs font-mono">
                Signed in as: <span className="text-blue-400 font-semibold">{user.email}</span>
              </span>
              <button
                onClick={onLogout}
                className="border border-red-900/60 bg-red-950/20 text-red-400 rounded-xl px-4 py-2 hover:bg-red-950/50 hover:text-red-300 transition text-xs font-semibold cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <button
                onClick={onLoginClick}
                className="text-slate-300 hover:text-white transition text-xs font-semibold px-3 py-2 cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={onSignupClick}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 transition text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
