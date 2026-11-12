"use client";

import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot, sectionGrid } from "../../styles";
import { LeavingServerCard } from "./components/LeavingServerCard";
import { PrivacyCard } from "./components/PrivacyCard";

export function PrivacySection() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const page = SETTINGS_PAGE_BY_ID.privacy;

  if (!currentUser) return null;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <div className={sectionGrid()}>
        <PrivacyCard user={currentUser} />
        <LeavingServerCard />
      </div>
    </div>
  );
}
