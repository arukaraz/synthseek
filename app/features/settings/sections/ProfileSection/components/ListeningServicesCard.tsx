"use client";

import { useTranslation } from "react-i18next";

import { useListeningConnections, useSeenPlaybackClients } from "@hooks/api";

import { SettingsCard } from "../../../components/SettingsCard";
import { ListeningServiceRow } from "./ListeningServiceRow";

export function ListeningServicesCard() {
  const { t } = useTranslation("settings");
  const connections = useListeningConnections();
  const seenClients = useSeenPlaybackClients();

  return (
    <SettingsCard title={t("profile.listening.title")} optional description={t("profile.listening.description")}>
      {connections.isError ? <p className="text-fg/60 text-sm">{t("profile.listening.unavailable")}</p> : null}
      {(connections.data ?? []).map((connection) => (
        <ListeningServiceRow key={connection.service} connection={connection} seenClients={seenClients.data ?? []} />
      ))}
    </SettingsCard>
  );
}
