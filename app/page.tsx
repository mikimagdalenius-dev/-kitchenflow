import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-heading">
        <h1 className="hero-title">Ca la Paquita</h1>
        <p className="hero-subtitle">Gestión clara de cocina, menús, usuarios y reportes.</p>
      </div>
      <Image
        src="/didaccuiner.png"
        alt="Didac Cuiner"
        width={380}
        height={380}
        className="hero-photo"
        priority
      />

      <Link href="/acceso?volverA=/usuarios" className="pc-btn hero-btn hover:no-underline">
        Acceder a la app
      </Link>
    </section>
  );
}
