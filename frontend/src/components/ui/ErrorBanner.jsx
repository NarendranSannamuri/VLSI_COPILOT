import { AlertCircle, X } from "lucide-react";

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-[1.2rem] border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-200 shadow-[0_18px_60px_rgba(248,113,113,0.08)]">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-500/15">
        <AlertCircle size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="mt-1 text-xs text-red-300/80">The workspace will remain available while you adjust the input.</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl p-1.5 hover:bg-red-500/20"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
