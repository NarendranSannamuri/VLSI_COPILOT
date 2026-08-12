function Footer() {
  return (
    <footer className="border-t border-slate-800/80 px-6 py-12 text-center text-sm text-slate-500">
      <p className="font-medium text-slate-300">VLSI Copilot</p>
      <p className="mt-2">
        © {new Date().getFullYear()} · Built with React, FastAPI & Gemini
      </p>
    </footer>
  );
}

export default Footer;
