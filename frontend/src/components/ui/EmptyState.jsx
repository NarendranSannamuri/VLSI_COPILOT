import { Inbox } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  title = "Nothing here yet",
  description = "Upload a Verilog file to begin analysis.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="glass-strong flex flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20">
        <Inbox size={28} />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight text-slate-100">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-8" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
