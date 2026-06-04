"use client";

import { Check, Link2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { cn } from "@utils/cn";
import { usePlexLogin } from "../hooks/usePlexLogin";
import { useAuthTransition } from "../hooks/useAuthTransition";
import { authPlexButton, authPlexIcon, authPlexWord } from "../styles";

export function PlexLoginButton() {
  const { t } = useTranslation("auth");
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
        t("auth.plex.waiting")
      ) : phase === "completed" ? (
        t("auth.plex.signedIn")
      ) : phase === "error" ? (
        <span>
          <Trans t={t} i18nKey="auth.plex.retry" components={[<span key="word" className={authPlexWord()} />]} />
        </span>
      ) : (
        <span>
          <Trans t={t} i18nKey="auth.plex.continue" components={[<span key="word" className={authPlexWord()} />]} />
        </span>
      )}
    </button>
  );
}
