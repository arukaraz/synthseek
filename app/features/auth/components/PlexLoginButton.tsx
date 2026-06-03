"use client";

import { Check, Link2, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@utils/cn";
import { usePlexLogin } from "../hooks/usePlexLogin";
import { useAuthTransition } from "../hooks/useAuthTransition";
import { authPlexButton, authPlexIcon, authPlexWord } from "../styles";

export function PlexLoginButton() {
  const { startLogin, phase } = usePlexLogin();
  const { markNavigating } = useAuthTransition();

  useEffect(() => {
    if (phase === "completed") markNavigating();
  }, [phase, markNavigating]);

  const busy = phase === "pending" || phase === "completed";

  return (
    <button
      type="button"
      onClick={startLogin}
      disabled={busy}
      aria-busy={phase === "pending"}
      data-error={phase === "error"}
      className={authPlexButton({ phase })}
    >
      {phase === "pending" ? (
        <Loader2 className={cn(authPlexIcon({ phase }), "animate-spin")} aria-hidden="true" />
      ) : phase === "completed" ? (
        <Check className={authPlexIcon({ phase })} aria-hidden="true" />
      ) : (
        <Link2 className={authPlexIcon({ phase })} aria-hidden="true" />
      )}
      {phase === "pending" ? (
        "Waiting for Plex..."
      ) : phase === "completed" ? (
        "Signed in"
      ) : phase === "error" ? (
        <span>
          Try <span className={authPlexWord()}>Plex</span> again
        </span>
      ) : (
        <span>
          Continue with <span className={authPlexWord()}>Plex</span>
        </span>
      )}
    </button>
  );
}
