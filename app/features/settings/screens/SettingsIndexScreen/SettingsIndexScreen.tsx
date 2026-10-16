"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { settingsHomeFor } from "../../helpers";

export function SettingsIndexScreen() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoading || typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      router.replace(settingsHomeFor(isAdmin));
    }
  }, [router, isAdmin, isLoading]);

  return null;
}
