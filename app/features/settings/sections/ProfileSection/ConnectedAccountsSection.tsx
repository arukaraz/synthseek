"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { ConnectedAccountsCard } from "./components/ConnectedAccountsCard";

export function ConnectedAccountsSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.connectedAccounts;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <ConnectedAccountsCard />
    </div>
  );
}
