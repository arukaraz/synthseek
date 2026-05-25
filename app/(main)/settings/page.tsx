"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsIndex() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      router.replace("/settings/general");
    }
  }, [router]);

  return null;
}
