"use client";

import { useTranslation } from "react-i18next";

import { Spinner } from "@components/ui/Spinner";

import { authQuietLink, signInRedirect, signInRedirectText } from "../styles";
import type { OidcRedirectNoticeProps } from "../types";

export function OidcRedirectNotice({ label, escapeHref }: OidcRedirectNoticeProps) {
  const { t } = useTranslation("auth");

  return (
    <div className={signInRedirect()}>
      <Spinner size="lg" decorative />
      <p role="status" className={signInRedirectText()}>
        {t("auth.redirect.title", { name: label })}
      </p>
      <a href={escapeHref} className={authQuietLink()}>
        {t("auth.redirect.escape")}
      </a>
    </div>
  );
}
