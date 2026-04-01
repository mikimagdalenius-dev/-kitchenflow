export default function CocinaLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 180, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 320, maxWidth: "88%", height: 18, margin: "0 auto" }} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pc-card p-4 space-y-2">
            <div className="pc-skeleton" style={{ width: 140, height: 22, margin: "0 auto" }} />
            <div className="pc-skeleton" style={{ height: 42 }} />
            <div className="pc-skeleton" style={{ height: 42 }} />
            <div className="pc-skeleton" style={{ width: 150, height: 40, margin: "8px auto 0" }} />
          </div>
        ))}
      </div>

      <div className="pc-skeleton" style={{ width: 170, height: 40, marginLeft: "auto" }} />

      <article className="pc-card p-4 space-y-3">
        <div className="pc-skeleton" style={{ width: 320, height: 26, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 180, height: 16, margin: "0 auto" }} />
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="pc-skeleton" style={{ width: "100%", height: 58 }} />
          ))}
        </div>
      </article>
    </section>
  );
}
