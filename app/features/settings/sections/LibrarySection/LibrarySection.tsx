"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { NamingCard } from "./NamingCard";
import { OrganiseCard } from "./OrganiseCard";

export function LibrarySection() {
  const { t } = useTranslation("settings");

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("library.page.title")} description={t("library.page.description")} />
      <NamingCard />
      <OrganiseCard />
    </div>
  );
}
