"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { contentRoot, emptyPanel } from "../styles";
import { SettingsPageHeader } from "./SettingsPageHeader";

export function SettingsAccessDenied() {
  const { t } = useTranslation("settings");
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("shell.accessDenied.title")} />
      <div className={emptyPanel()}>
        <ShieldAlert className="text-fg/40 size-6" />
        <span className="text-fg/60 text-sm">{t("shell.accessDenied.message")}</span>
      </div>
    </div>
  );
}
