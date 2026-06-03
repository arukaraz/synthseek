"use client";

import { Button } from "@components/ui/Button";
import { usePlexLogin } from "../hooks/usePlexLogin";

export function PlexLoginButton() {
  const { startLogin, phase } = usePlexLogin();

  const busy = phase === "pending" || phase === "completed";
  const label =
    phase === "pending"
      ? "Waiting for Plex..."
      : phase === "completed"
        ? "Signed in"
        : phase === "error"
          ? "Try Plex again"
          : "Sign in with Plex";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={startLogin}
      disabled={busy}
      aria-busy={phase === "pending"}
      data-error={phase === "error"}
      className="w-full"
    >
      {label}
    </Button>
  );
}
