export default function FicharLoading() {
  return (
    <section className="kiosk-page" aria-hidden>
      <div className="kiosk-wrap">
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 340, height: 64, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-skeleton pc-skeleton-line" style={{ width: 260, height: 28, margin: "0 auto", borderRadius: 100 }} />
        <div className="pc-card kiosk-card" style={{ opacity: 0.6 }}>
          <div className="pc-skeleton" style={{ height: 68, borderRadius: 12 }} />
          <div className="flex justify-center">
            <div className="pc-skeleton" style={{ width: 240, height: 72, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
