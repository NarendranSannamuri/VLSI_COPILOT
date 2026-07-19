import { Github } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800">

      <h1 className="text-2xl font-bold tracking-wide">
        VLSI Copilot
      </h1>

      <button className="flex items-center gap-2 border border-slate-700 rounded-xl px-5 py-2 hover:bg-slate-800 transition">

        <Github size={18}/>

        GitHub

      </button>

    </nav>
  );
}

export default Navbar;