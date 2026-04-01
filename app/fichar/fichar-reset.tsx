"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function FicharReset({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      router.replace("/fichar");
      router.refresh();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [active, router]);

  return null;
}
