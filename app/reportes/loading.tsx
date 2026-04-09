export default function ReportesLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 300, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 460, maxWidth: "92%", margin: "0 auto" }} />
      </div>

      <div className="pc-card p-4">
        <div className="flex flex-wrap items-end justify-center gap-3">
          <div className="pc-skeleton" style={{ width: 220, height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ width: 130, height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ width: 150, height: 40, borderRadius: 10 }} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 pc-stagger">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pc-skeleton" style={{ height: 116, borderRadius: 14 }} />
        ))}
      </div>

      <div className="pc-card p-4 space-y-3">
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 200, height: 22, margin: "0 auto", borderRadius: 100 }} />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          ))}
        </div>
        <div className="pc-skeleton" style={{ height: 220, borderRadius: 10 }} />
      </div>
    </section>
  );
}
