"use client";

import { useTranslation } from "react-i18next";

import { AppLogo } from "@components/ui/AppLogo";
import { BrandedLoader } from "@components/ui/BrandedLoader";

import { useAuthTransition } from "../hooks/useAuthTransition";
import {
  authCard,
  authDivider,
  authDividerLabel,
  authDividerRule,
  authEyebrow,
  authHeader,
  authHelper,
} from "../styles";
import { LoginForm } from "./LoginForm";
import { PlexLoginButton } from "./PlexLoginButton";

export function LoginScreenContent() {
  const { t } = useTranslation("auth");
  const { isNavigating } = useAuthTransition();

  if (isNavigating) return <BrandedLoader label={t("auth.login.signingIn")} />;

  return (
    <div className={authCard()}>
      <header className={authHeader()}>
        <h1 className="sr-only">{t("auth.login.loadingTitle")}</h1>
        <AppLogo iconClassName="h-11 w-auto sm:h-12" wordmarkClassName="sm:text-3xl" />
        <p className={authEyebrow()}>{t("auth.login.eyebrow")}</p>
      </header>

      <PlexLoginButton />

      <div className={authDivider()}>
        <span className={authDividerRule()} />
        <span className={authDividerLabel()}>{t("auth.login.dividerLabel")}</span>
        <span className={authDividerRule()} />
      </div>

      <LoginForm />

      <p className={authHelper()}>{t("auth.login.noAccount")}</p>
    </div>
  );
}
