"use client";

import { useTranslation } from "react-i18next";

import { AccessibilityPanel } from "@components/AccessibilityPanel";
import { AppLogo } from "@components/ui/AppLogo";

import { authEyebrow, authHeader, authHelper, signInFooter, signInSheet } from "../styles";
import { SignInMethods } from "./SignInMethods";

export function SignInPanel() {
  const { t } = useTranslation("auth");

  return (
    <section className={signInSheet()}>
      <header className={authHeader()}>
        <h1 className="sr-only">{t("auth.login.loadingTitle")}</h1>
        <AppLogo iconClassName="h-11 w-auto sm:h-12" wordmarkClassName="sm:text-3xl" />
        <p className={authEyebrow()}>{t("auth.login.eyebrow")}</p>
      </header>

      <SignInMethods />

      <footer className={signInFooter()}>
        <p className={authHelper()}>{t("auth.login.noAccount")}</p>
        <AccessibilityPanel />
      </footer>
    </section>
  );
}
