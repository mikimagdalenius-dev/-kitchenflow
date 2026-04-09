export default function CalendarioLoading() {
  return (
    <section className="page-stack text-center" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 300, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 340, maxWidth: "90%", margin: "0 auto" }} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 pc-stagger">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-2 text-left">
            <div className="pc-skeleton pc-skeleton-line" style={{ width: 110, height: 18, borderRadius: 100 }} />
            <div className="pc-skeleton" style={{ height: 52, borderRadius: 10 }} />
            <div className="pc-skeleton" style={{ height: 52, borderRadius: 10 }} />
            <div className="pc-skeleton" style={{ width: "75%", height: 52, borderRadius: 10 }} />
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 pc-stagger">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-2 text-left">
            <div className="pc-skeleton pc-skeleton-line" style={{ width: 110, height: 18, borderRadius: 100 }} />
            <div className="pc-skeleton" style={{ height: 52, borderRadius: 10 }} />
            <div className="pc-skeleton" style={{ width: "70%", height: 52, borderRadius: 10 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
