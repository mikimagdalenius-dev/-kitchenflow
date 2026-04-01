export default function ReportesLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 320, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 500, maxWidth: "92%", height: 18, margin: "0 auto" }} />
      </div>

      <div className="pc-card p-4">
        <div className="flex flex-wrap items-end justify-center gap-3">
          <div className="pc-skeleton" style={{ width: 220, height: 42 }} />
          <div className="pc-skeleton" style={{ width: 130, height: 42 }} />
          <div className="pc-skeleton" style={{ width: 150, height: 42 }} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pc-skeleton" style={{ height: 116 }} />
        ))}
      </div>

      <div className="pc-card p-4 space-y-3">
        <div className="pc-skeleton" style={{ width: 220, height: 26, margin: "0 auto" }} />
        <div className="grid gap-3 md:grid-cols-4">
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
        </div>
        <div className="pc-skeleton" style={{ width: "100%", height: 230 }} />
      </div>
    </section>
  );
}
