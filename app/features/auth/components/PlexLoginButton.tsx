"use client";

import { Check, Link2, Loader2 } from "lucide-react";
import { useEffect, useId } from "react";
import { Trans, useTranslation } from "react-i18next";

import { PlexPinHelp } from "@components/PlexPinHelp";
import { cn } from "@utils/cn";
import { usePlexLogin } from "../hooks/usePlexLogin";
import { useAuthTransition } from "../hooks/useAuthTransition";
import { authPlexButton, authPlexIcon, authPlexWord, signInMethodsColumn } from "../styles";
import { SignInFailureNotice } from "./SignInFailureNotice";

export function PlexLoginButton() {
  const { t } = useTranslation("auth");
  const noticeId = useId();
  const { startLogin, phase, session, failure } = usePlexLogin();
  const { markNavigating } = useAuthTransition();

  useEffect(() => {
    if (phase === "completed") markNavigating();
  }, [phase, markNavigating]);

  const busy = phase === "pending" || phase === "completed";

  return (
    <div className={signInMethodsColumn()}>
      <button
        type="button"
        onClick={startLogin}
        disabled={busy}
        aria-busy={phase === "pending"}
        aria-describedby={failure ? noticeId : undefined}
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
      <PlexPinHelp session={session} phase={phase} />
      {failure ? <SignInFailureNotice failure={failure} id={noticeId} /> : null}
    </div>
  );
}
