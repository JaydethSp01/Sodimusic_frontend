export default function AdminDashboardLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-8 w-44 animate-pulse rounded bg-background-elevated" aria-hidden />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-background-elevated" aria-hidden />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-background-card p-4">
            <div className="h-4 w-48 animate-pulse rounded bg-background-elevated" aria-hidden />
            <div className="mt-4 h-10 w-20 animate-pulse rounded bg-background-elevated" aria-hidden />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
          role="status"
          aria-label="Cargando panel admin"
        />
      </div>
    </div>
  );
}

