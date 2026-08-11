import React from "react";

function Navbar({ user, onLogout, onLoginClick, onSignupClick }) {
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        {/* VLSI Copilot SVG Logo */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8 select-none" fill="none">
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
        <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          VLSI Copilot
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-mono">
              Signed in as: <span className="text-blue-400 font-semibold">{user.email}</span>
            </span>
            <button
              onClick={onLogout}
              className="border border-red-900/60 bg-red-950/20 text-red-400 rounded-xl px-4 py-2 hover:bg-red-950/50 hover:text-red-300 transition text-sm font-semibold"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-slate-300 hover:text-white transition text-sm font-semibold px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={onSignupClick}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 transition text-sm font-bold shadow-lg shadow-blue-500/10"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
