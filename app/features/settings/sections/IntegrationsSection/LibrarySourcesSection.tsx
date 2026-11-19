"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { LibrarySyncCard } from "./LibrarySyncCard";
import { MediaServersSection } from "./MediaServersSection";
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
    <>
      <MediaServersSection settings={data} />
      <div className={sectionGrid()}>
        <SpotifySourceCard spotify={data.connections.spotify} />
        <LibrarySyncCard initial={{ syncIntervalMinutes: data.library.syncIntervalMinutes }} />
      </div>
    </>
  );
}
