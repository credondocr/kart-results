const SeasonSkeleton = () => {
  return (
    <div className="mt-24 mx-auto max-w-6xl px-4" role="status" aria-label="Cargando posiciones">
      <div className="skeleton-bar h-3 w-56 mx-auto rounded-full" />
      <div className="mt-6 flex justify-center">
        <div className="skeleton-bar h-11 w-96 max-w-full rounded-full" />
      </div>
      <div className="mt-12">
        <div className="skeleton-bar h-9 w-56 mx-auto rounded-lg" />
        <div className="mt-8 table-container">
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="flex items-center gap-4 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="skeleton-bar h-8 w-8 rounded-lg shrink-0" />
              <div className="skeleton-bar h-4 w-12 rounded shrink-0" />
              <div className="skeleton-bar h-4 w-40 max-w-[40%] rounded" />
              <div className="ml-auto flex gap-3">
                {Array.from({ length: 5 }).map((_, col) => (
                  <div key={col} className="skeleton-bar h-4 w-9 rounded" />
                ))}
              </div>
              <div className="skeleton-bar h-4 w-14 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando posiciones…</span>
    </div>
  );
};

export default SeasonSkeleton;
