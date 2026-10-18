import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando panel admin" aria-busy="true">
      <div className="rounded-lg border border-line-1 bg-ink-1/60 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-11 w-full md:max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-32 md:ml-auto" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-line-1 bg-ink-2 p-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-9 w-20" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-line-1 bg-ink-2">
        <div className="border-b border-line-2 px-4 py-4">
          <Skeleton className="h-3 w-48" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex h-14 items-center gap-6 border-b border-line-1 px-4 last:border-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
