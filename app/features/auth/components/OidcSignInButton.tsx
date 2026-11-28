"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useId } from "react";
import { Trans, useTranslation } from "react-i18next";

import { authProviderButton, authProviderIcon, authProviderWord, signInMethodsColumn } from "../styles";
import type { OidcSignInButtonProps } from "../types";
import { SignInFailureNotice } from "./SignInFailureNotice";

export function OidcSignInButton({ label, prominent, phase, failure, onStart }: OidcSignInButtonProps) {
  const { t } = useTranslation("auth");
  const noticeId = useId();
  const Icon = phase === "pending" ? Loader2 : ShieldCheck;
  const word = <span key="word" className={authProviderWord({ provider: "oidc" })} />;

  return (
    <div className={signInMethodsColumn()}>
      <button
        type="button"
        onClick={onStart}
        disabled={phase === "pending"}
        aria-busy={phase === "pending"}
        aria-describedby={failure ? noticeId : undefined}
        className={authProviderButton({ provider: "oidc", prominent, phase })}
      >
        <Icon className={authProviderIcon({ provider: "oidc", phase })} aria-hidden="true" />
        {phase === "pending" ? (
          t("auth.provider.waiting", { name: label })
        ) : (
          <span>
            <Trans
              t={t}
              i18nKey={phase === "error" ? "auth.provider.retry" : "auth.provider.continue"}
              values={{ name: label }}
              components={[word]}
            />
          </span>
        )}
      </button>
      {failure ? <SignInFailureNotice failure={failure} id={noticeId} /> : null}
    </div>
  );
}
