export default function GlobalLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary"
        role="status"
        aria-label="Cargando contenido"
      />
    </div>
  );
}
