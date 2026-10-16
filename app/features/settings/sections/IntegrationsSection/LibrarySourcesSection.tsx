"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { serverConnections } from "../../helpers";
import { emptyPanel, sectionGrid } from "../../styles";
import { LibrarySyncCard } from "./LibrarySyncCard";
import { MediaServerSourcesCard } from "./MediaServerSourcesCard";
import { SpotifySourceCard } from "./SpotifySourceCard";

export function LibrarySourcesSection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useSettings();

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
        <span className="text-destructive-vivid text-sm">
          {t("common.loadFailedWithReason", { reason: error?.message ?? t("common.unknownError") })}
        </span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <SpotifySourceCard spotify={data.connections.spotify} />
      <div className="flex flex-col gap-5 sm:gap-6">
        <MediaServerSourcesCard connected={serverConnections(data.connections)} />
        <LibrarySyncCard initial={{ syncIntervalMinutes: data.library.syncIntervalMinutes }} />
      </div>
    </div>
  );
}
