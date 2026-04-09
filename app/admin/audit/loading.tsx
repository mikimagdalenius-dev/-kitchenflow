export default function AuditLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header text-center">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 280, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 320, maxWidth: "90%", margin: "0 auto" }} />
      </div>

      <div className="pc-card p-3">
        <div className="grid gap-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: "160px 1fr 1fr 2fr", padding: "8px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="pc-skeleton pc-skeleton-line" style={{ height: 12, borderRadius: 100 }} />
            ))}
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="grid gap-2" style={{ gridTemplateColumns: "160px 1fr 1fr 2fr", padding: "8px", borderTop: "1px dashed #e2e8f0" }}>
              <div className="pc-skeleton pc-skeleton-line" style={{ width: "80%", borderRadius: 100 }} />
              <div className="pc-skeleton pc-skeleton-line" style={{ width: "60%", borderRadius: 100 }} />
              <div className="pc-skeleton pc-skeleton-line" style={{ width: "70%", borderRadius: 100 }} />
              <div className="pc-skeleton" style={{ height: 40, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
