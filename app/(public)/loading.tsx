export default function PublicRoutesLoading() {
  return (
    <div className="mx-auto flex min-h-[45vh] w-full max-w-7xl items-center justify-center px-4 lg:px-8">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary"
        role="status"
        aria-label="Cargando página"
      />
    </div>
  );
}
