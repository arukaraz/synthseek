"use client";

import { useTranslation } from "react-i18next";

import { BoardGrid } from "@components/BoardGrid";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";

import { SettingsCard } from "../../../../components/SettingsCard";
import { AddedTile } from "./AddedTile";
import { AnalyticsCell } from "./AnalyticsCell";
import { DecadesTile } from "./DecadesTile";
import { DownloadsTile } from "./DownloadsTile";
import { GrowthTile } from "./GrowthTile";
import { ListeningClockTile } from "./ListeningClockTile";
import { ListeningTimeTile } from "./ListeningTimeTile";
import { PlaysTile } from "./PlaysTile";
import { QualityTile } from "./QualityTile";
import { ScrobblesTile } from "./ScrobblesTile";

export function AnalyticsBoard() {
  const { t } = useTranslation("settings");
  const device = useBoardDevice();

  return (
    <SettingsCard title={t("overview.analytics.title")} description={t("overview.analytics.description")}>
      <BoardGrid device={device}>
        <AnalyticsCell device={device} size="S" height="short">
          <PlaysTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="S" height="short">
          <ListeningTimeTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="S" height="short">
          <AddedTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="S" height="short">
          <DownloadsTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="M" height="regular">
          <DecadesTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="M" height="regular">
          <QualityTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="M" height="regular">
          <ScrobblesTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="M" height="regular">
          <GrowthTile />
        </AnalyticsCell>
        <AnalyticsCell device={device} size="L" height="regular">
          <ListeningClockTile />
        </AnalyticsCell>
      </BoardGrid>
    </SettingsCard>
  );
}
