"use client";

import { useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { ProviderMark } from "@components/LibrarySourceModal";

import { authProviderButton, authProviderIcon, authProviderWord, signInMethodsColumn } from "../styles";
import type { JellyfinSignInProps } from "../types";
import { JellyfinSignInForm } from "./JellyfinSignInForm";

export function JellyfinSignIn({ label, initiallyOpen }: JellyfinSignInProps) {
  const { t } = useTranslation("auth");
  const formId = useId();
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div className={signInMethodsColumn()}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={formId}
        className={authProviderButton({ provider: "jellyfin" })}
      >
        <span className={authProviderIcon({ provider: "jellyfin" })} aria-hidden="true">
          <ProviderMark provider="jellyfin" size={18} />
        </span>
        <span>
          <Trans
            t={t}
            i18nKey="auth.provider.continue"
            values={{ name: label }}
            components={[<span key="word" className={authProviderWord({ provider: "jellyfin" })} />]}
          />
        </span>
      </button>
      {open ? <JellyfinSignInForm id={formId} /> : null}
    </div>
  );
}
