"use client";

import { useTranslation } from "react-i18next";

import { AccessibilityControls } from "@components/AccessibilityControls";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot, settingsCard } from "../../styles";

export function AccessibilitySection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.accessibility;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <section className={settingsCard()} aria-label={t(page.labelKey)}>
        <AccessibilityControls scope="account" />
      </section>
    </div>
  );
}
