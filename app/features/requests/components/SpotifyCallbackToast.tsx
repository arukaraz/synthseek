"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useErrorBoundary } from "@modules/errors";

export function SpotifyCallbackToast() {
  const params = useSearchParams();
  const router = useRouter();
  const errors = useErrorBoundary();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const status = params.get("spotify");
    if (!status) return;

    handled.current = true;

    if (status === "connected") {
      errors.notifySuccess("spotify", "connected");
    } else if (status === "error") {
      const reason = params.get("reason") ?? "exchange_failed";
      errors.notifyById("spotify", reason, {
        fallback: { title: "Spotify connection failed" },
      });
    }

    const next = new URLSearchParams(params.toString());
    next.delete("spotify");
    next.delete("reason");
    const query = next.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [params, router, errors]);

  return null;
}
