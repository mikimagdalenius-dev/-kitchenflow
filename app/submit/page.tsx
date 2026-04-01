import { redirect } from "next/navigation";

/**
 * Legacy route kept for backwards compatibility.
 * Old devices/bookmarks may still open /submit.
 */
export default function LegacySubmitPage() {
  redirect("/fichar");
}
