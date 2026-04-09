"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function FicharReset({ active, delay = 2200 }: { active: boolean; delay?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      router.replace("/fichar");
      router.refresh();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, delay, router]);

  return null;
}
