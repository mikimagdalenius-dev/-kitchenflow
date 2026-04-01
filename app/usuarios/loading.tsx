export default function UsuariosLoading() {
  return (
    <section className="page-stack" aria-hidden>
      <div className="page-header">
        <div className="pc-skeleton pc-skeleton-title" style={{ width: 230, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 420, maxWidth: "92%", height: 18, margin: "0 auto" }} />
      </div>

      <div className="pc-card users-self-card p-4 space-y-3">
        <div className="pc-skeleton" style={{ width: 250, height: 24, margin: "0 auto" }} />
        <div className="grid gap-2 sm:grid-cols-2 max-w-xl mx-auto">
          <div className="pc-skeleton" style={{ height: 18 }} />
          <div className="pc-skeleton" style={{ height: 18 }} />
          <div className="pc-skeleton" style={{ height: 18 }} />
          <div className="pc-skeleton" style={{ height: 18 }} />
        </div>
        <div className="pc-skeleton" style={{ width: "min(620px, 94%)", height: 94, margin: "0 auto" }} />
        <div className="pc-skeleton" style={{ width: 190, height: 40, margin: "0 auto" }} />
      </div>

      <div className="users-admin-grid">
        <div className="pc-card users-admin-card p-4 space-y-2">
          <div className="pc-skeleton" style={{ width: 150, height: 22, margin: "0 auto" }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ width: 160, height: 40 }} />
        </div>

        <div className="pc-card users-admin-card p-4 space-y-2">
          <div className="pc-skeleton" style={{ width: 170, height: 22, margin: "0 auto" }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="pc-skeleton" style={{ height: 42 }} />
          <div className="grid gap-2 grid-cols-2">
            <div className="pc-skeleton" style={{ height: 40 }} />
            <div className="pc-skeleton" style={{ height: 40 }} />
          </div>
        </div>
      </div>

      <div className="pc-skeleton" style={{ width: 230, height: 42, margin: "0 auto" }} />

      <div className="pc-card p-2">
        <div className="pc-skeleton" style={{ width: "100%", height: 300, borderRadius: 10 }} />
      </div>
    </section>
  );
}
