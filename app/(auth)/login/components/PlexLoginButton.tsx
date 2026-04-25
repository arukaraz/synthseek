"use client";

import { Button } from "@components/ui/Button";
import { usePlexLogin } from "@features/auth/hooks/usePlexLogin";

export function PlexLoginButton() {
  const { startLogin, isPending } = usePlexLogin();

  return (
    <Button type="button" variant="outline" onClick={startLogin} disabled={isPending} className="w-full">
      {isPending ? "Waiting for Plex..." : "Sign in with Plex"}
    </Button>
  );
}
