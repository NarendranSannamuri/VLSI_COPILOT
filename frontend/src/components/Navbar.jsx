function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800">
      <h1 className="text-2xl font-bold tracking-wide">
        VLSI Copilot
      </h1>

      <button className="border border-slate-700 rounded-xl px-5 py-2 hover:bg-slate-800 transition">
        GitHub
      </button>
    </nav>
  );
}

export default Navbar;