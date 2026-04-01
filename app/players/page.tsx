import { redirect } from "next/navigation";

/**
 * Legacy route from the old template.
 * Redirected to home to avoid dead links.
 */
export default function LegacyPlayersPage() {
  redirect("/");
}
