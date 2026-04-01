export default function CalendarioLoading() {
  return (
    <section className="page-stack text-center" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 320, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 360, maxWidth: "90%", height: 18, margin: "0 auto" }} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-2 text-left">
            <div className="pc-skeleton" style={{ width: 120, height: 22 }} />
            <div className="pc-skeleton" style={{ width: "100%", height: 54 }} />
            <div className="pc-skeleton" style={{ width: "100%", height: 54 }} />
            <div className="pc-skeleton" style={{ width: "80%", height: 54 }} />
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-2 text-left">
            <div className="pc-skeleton" style={{ width: 120, height: 22 }} />
            <div className="pc-skeleton" style={{ width: "100%", height: 54 }} />
            <div className="pc-skeleton" style={{ width: "75%", height: 54 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
