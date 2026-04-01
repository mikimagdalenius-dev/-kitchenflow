"use client";

import type { Role } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; roles: Role[] };

const tabs: Tab[] = [
  { href: "/cocina", label: "Cocina", roles: ["ADMIN", "COOK"] },
  { href: "/usuarios", label: "Usuarios", roles: ["ADMIN", "COOK", "HR", "EMPLOYEE"] },
  { href: "/calendario", label: "Calendario", roles: ["ADMIN", "COOK", "HR", "EMPLOYEE"] },
  { href: "/fichar", label: "Fichar", roles: ["ADMIN", "KIOSK"] },
  { href: "/reportes", label: "Fichajes", roles: ["ADMIN", "HR", "COOK"] },
  { href: "/admin/audit", label: "Audit", roles: ["ADMIN"] }
];

export function Navbar({
  sessionStarted,
  role,
  logoutAction
}: {
  sessionStarted: boolean;
  role?: Role;
  logoutAction?: (formData: FormData) => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const visibleTabs = role ? tabs.filter((tab) => tab.roles.includes(role)) : [];

  return (
    <header className="pc-topbar">
      <div className="pc-nav-wrap">
        <div className="pc-nav-main">
          <Link href="/" className="pc-logo hover:no-underline">
            Ca la Paquita
          </Link>

          {sessionStarted ? (
            <form action={logoutAction}>
              <button className="pc-btn pc-btn-secondary" type="submit" aria-live="polite">
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link href="/acceso" className="pc-btn pc-btn-secondary hover:no-underline">
              Inicio de sesión
            </Link>
          )}
        </div>

        {!isHome && visibleTabs.length > 0 && (
          <nav className="pc-tabs" aria-label="navegación principal">
            {visibleTabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href} className={`pc-tab ${active ? "is-active" : ""}`}>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
