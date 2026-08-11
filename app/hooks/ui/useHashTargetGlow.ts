"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { clearHashTargetGlow, hashTargetFromLocation, triggerHashTargetGlow } from "@utils/hash-target-glow";

export function useHashTargetGlow() {
  const pathname = usePathname();

  useEffect(() => {
    triggerHashTargetGlow(hashTargetFromLocation());

    const onHashChange = () => triggerHashTargetGlow(hashTargetFromLocation());
    window.addEventListener("hashchange", onHashChange);

    return () => {
      clearHashTargetGlow();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname]);
}
