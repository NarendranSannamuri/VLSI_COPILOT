export function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.24)] hover:-translate-y-0.5 hover:shadow-[0_20px_90px_rgba(34,211,238,0.28)] disabled:bg-slate-800/60 disabled:text-slate-400",
    secondary:
      "bg-slate-900/90 text-slate-100 border border-slate-700 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-slate-800/95 disabled:border-slate-700/60",
    ghost:
      "bg-transparent text-slate-200 border border-slate-700/30 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900/50",
    danger:
      "bg-red-500/15 text-red-300 border border-red-500/30 hover:-translate-y-0.5 hover:bg-red-500/25 disabled:border-slate-700/60",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
