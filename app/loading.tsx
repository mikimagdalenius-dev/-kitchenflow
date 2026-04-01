export default function Loading() {
  return (
    <section className="hero" aria-hidden>
      <div className="grid gap-2 place-items-center">
        <div className="pc-skeleton" style={{ width: "min(460px, 88vw)", height: 64, borderRadius: 14 }} />
        <div className="pc-skeleton" style={{ width: "min(520px, 92vw)", height: 20, borderRadius: 10 }} />
      </div>

      <div className="pc-skeleton hero-photo" style={{ width: "min(390px, 84vw)", height: "min(390px, 84vw)" }} />

      <div className="pc-skeleton" style={{ width: 190, height: 44, borderRadius: 12 }} />
    </section>
  );
}
