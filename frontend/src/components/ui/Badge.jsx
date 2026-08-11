export function Badge({ children, tone = "default", className = "" }) {
  const tones = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    accent: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    danger: "bg-red-500/10 text-red-300 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
