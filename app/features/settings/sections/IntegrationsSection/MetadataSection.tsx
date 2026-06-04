"use client";

import { useTranslation } from "react-i18next";

import { DiscoveryCard } from "@features/discovery-integrations";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { emptyPanel, sectionGrid } from "../../styles";
import { EnrichmentCard } from "./EnrichmentCard";
import { LibrarySourcesCard } from "./LibrarySourcesCard";

export function MetadataSection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useSettings();
  const { isAdmin } = useAuthContext();

  if (isLoading) {
    return (
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{t("common.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={emptyPanel()}>
        <span className="text-sm text-red-400">{t("common.loadFailed")}</span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <DiscoveryCard className="lg:col-span-2" />
      {isAdmin ? (
        <>
          <EnrichmentCard initial={data.connections.enrichment} />
          <LibrarySourcesCard spotify={data.connections.spotify} enrichment={data.connections.enrichment} />
        </>
      ) : null}
    </div>
  );
}
