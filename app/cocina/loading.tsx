export default function CocinaLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 160, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 300, maxWidth: "88%", margin: "0 auto" }} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-3">
            <div className="pc-skeleton pc-skeleton-line" style={{ width: 130, height: 18, margin: "0 auto", borderRadius: 100 }} />
            <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
            <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
            <div className="flex justify-center">
              <div className="pc-skeleton pc-skeleton-btn" style={{ width: 140 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="pc-skeleton pc-skeleton-btn" style={{ width: 160 }} />
      </div>

      <article className="pc-card p-4 space-y-3">
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 300, height: 22, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 160, margin: "0 auto" }} />
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="pc-skeleton" style={{ height: 56, borderRadius: 10 }} />
          ))}
        </div>
      </article>
    </section>
  );
}
