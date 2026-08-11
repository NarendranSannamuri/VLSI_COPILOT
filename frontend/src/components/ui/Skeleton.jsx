export function Skeleton({ className = "" }) {
  return (
    <div
      className={`skeleton-glow rounded-[1.6rem] border border-slate-800/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/70 p-6 md:p-8">
        <Skeleton className="mb-4 h-6 w-44" />
        <Skeleton className="mb-3 h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export default Skeleton;
