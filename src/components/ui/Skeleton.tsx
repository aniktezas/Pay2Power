import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('skeleton rounded-lg', className)} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
