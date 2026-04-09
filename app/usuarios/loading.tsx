export default function UsuariosLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 220, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 380, maxWidth: "90%", margin: "0 auto" }} />
      </div>

      <div className="pc-card users-self-card p-4 space-y-3">
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 200, height: 20, margin: "0 auto", borderRadius: 100 }} />
        <div className="grid gap-2 sm:grid-cols-2 max-w-xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pc-skeleton pc-skeleton-line" style={{ height: 14 }} />
          ))}
        </div>
        <div className="pc-skeleton" style={{ width: "min(620px, 94%)", height: 88, margin: "0 auto", borderRadius: 12 }} />
        <div className="flex justify-center">
          <div className="pc-skeleton pc-skeleton-btn" style={{ width: 180 }} />
        </div>
      </div>

      <div className="users-admin-grid">
        <div className="pc-card users-admin-card p-4 space-y-3">
          <div className="pc-skeleton pc-skeleton-line" style={{ width: 140, height: 18, margin: "0 auto", borderRadius: 100 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton pc-skeleton-btn" style={{ width: 150 }} />
        </div>

        <div className="pc-card users-admin-card p-4 space-y-3">
          <div className="pc-skeleton pc-skeleton-line" style={{ width: 160, height: 18, margin: "0 auto", borderRadius: 100 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="pc-skeleton" style={{ height: 40, borderRadius: 10 }} />
          <div className="grid gap-2 grid-cols-2">
            <div className="pc-skeleton pc-skeleton-btn" />
            <div className="pc-skeleton pc-skeleton-btn" />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="pc-skeleton pc-skeleton-btn" style={{ width: 220 }} />
      </div>

      <div className="pc-card p-3">
        <div className="pc-skeleton" style={{ width: "100%", height: 280, borderRadius: 10 }} />
      </div>
    </section>
  );
}
