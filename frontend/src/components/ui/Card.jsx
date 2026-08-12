export function Card({ children, className = "", hover = true }) {
  return (
    <div
      className={`glass-strong overflow-hidden border border-slate-800/70 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.3)] md:p-8 ${
        hover
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-[0_30px_110px_rgba(34,211,238,0.16)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
