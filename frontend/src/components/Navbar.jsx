import React from "react";

function Navbar({ user, onLogout, onLoginClick, onSignupClick }) {
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800">
      <h1 className="text-2xl font-bold tracking-wide">
        VLSI Copilot
      </h1>

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
