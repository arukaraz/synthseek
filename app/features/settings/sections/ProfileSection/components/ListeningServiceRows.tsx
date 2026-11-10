"use client";

import { useTranslation } from "react-i18next";

import { DiscoveryFeeds } from "@features/discovery-integrations";
import { useListeningConnections, useSeenPlaybackClients } from "@hooks/api";

import { ListeningServiceRow } from "./ListeningServiceRow";

export function ListeningServiceRows() {
  const { t } = useTranslation("settings");
  const connections = useListeningConnections();
  const seenClients = useSeenPlaybackClients();

  return (
    <>
      {connections.isError ? <p className="text-fg/60 text-sm">{t("profile.listening.unavailable")}</p> : null}
      {(connections.data ?? []).map((connection) => (
        <ListeningServiceRow key={connection.service} connection={connection} seenClients={seenClients.data ?? []}>
          <DiscoveryFeeds service={connection.service} apiKeyConfigured={connection.configured} />
        </ListeningServiceRow>
      ))}
    </>
  );
}
