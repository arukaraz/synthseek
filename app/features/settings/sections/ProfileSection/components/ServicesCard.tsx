"use client";

import { useTranslation } from "react-i18next";

import { SettingsCard } from "../../../components/SettingsCard";
import { ConnectedAccountRows } from "./ConnectedAccountRows";
import { ListeningServiceRows } from "./ListeningServiceRows";
import { SessionSourceRows } from "./SessionSourceRows";

export function ServicesCard() {
  const { t } = useTranslation("settings");

  return (
    <SettingsCard title={t("profile.connected.title")} description={t("profile.connected.description")}>
      <ConnectedAccountRows />
      <SessionSourceRows />
      <ListeningServiceRows />
    </SettingsCard>
  );
}
