"use client";

import { useTranslation } from "react-i18next";

import { contentRoot, emptyPanel } from "../styles";
import { SettingsPageHeader } from "./SettingsPageHeader";
import type { SettingsPagePlaceholderProps } from "./types";

export function SettingsPagePlaceholder({ title, message }: SettingsPagePlaceholderProps) {
  const { t } = useTranslation("settings");
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={title} />
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{message ?? t("shell.placeholder.comingSoon")}</span>
      </div>
    </div>
  );
}
