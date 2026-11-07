"use client";

import { Trans, useTranslation } from "react-i18next";

import { HashLink, inlineLink, pathnameOf } from "@components/HashLink";
import { isAdminOnlySettingsPath } from "@features/settings/helpers";
import { useAuthContext } from "@modules/providers/AuthProvider";

import type { SettingsLinkNoteProps } from "./types";

export function SettingsLinkNote({ i18nKey, href }: SettingsLinkNoteProps) {
  const { t } = useTranslation("discover");
  const { isAdmin } = useAuthContext();
  const reachable = isAdmin || !isAdminOnlySettingsPath(pathnameOf(href));

  return (
    <Trans
      t={t}
      i18nKey={i18nKey}
      components={{ field: reachable ? <HashLink href={href} className={inlineLink()} /> : <span /> }}
    />
  );
}
