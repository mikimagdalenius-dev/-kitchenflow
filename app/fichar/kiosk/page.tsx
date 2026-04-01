import { redirect } from "next/navigation";

/**
 * Legacy route kept for backwards compatibility.
 * Kiosk mode was merged into /fichar.
 */
export default function FicharKioskRedirectPage() {
  redirect("/fichar");
}
