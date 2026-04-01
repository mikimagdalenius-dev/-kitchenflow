import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { cerrarSesionAction } from "@/app/acceso/actions";
import { getSessionUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ca la Paquita",
  description: "Aplicación interna de cocina y fichajes"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="es">
      <body>
        <div className="pc-watermark" aria-hidden="true" />
        <div className="pc-page">
          <Navbar sessionStarted={Boolean(sessionUser)} role={sessionUser?.role} logoutAction={cerrarSesionAction} />
          {sessionUser && (
            <div className="pc-session-strip">
              <span>Sesión iniciada como {sessionUser.fullName}</span>
            </div>
          )}
          <main className="pc-shell">{children}</main>
          <div className="pc-credit">by miki.ls</div>
        </div>
      </body>
    </html>
  );
}
