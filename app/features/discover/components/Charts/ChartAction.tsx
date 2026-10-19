"use client";

import { Download, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { widgetRowButton } from "../WidgetRow/styles";
import type { ChartActionProps } from "./types";

export function ChartAction({ entry }: ChartActionProps) {
  const { t } = useTranslation("discover");
  const { openForResult } = useContentRequestFlow();
  const { playEntity } = useEntityPlayback();
  const { libraryTrackId, track } = entry;

  if (libraryTrackId) {
    return (
      <Button
        size="sm"
        className={widgetRowButton()}
        aria-label={t("history.play", { name: entry.title })}
        onClick={() => void playEntity({ kind: "tracks", trackIds: [libraryTrackId] })}
      >
        <Play />
        {t("charts.play")}
      </Button>
    );
  }
  if (track) {
    return (
      <Button
        size="sm"
        variant="accent"
        className={widgetRowButton()}
        aria-label={t("requestNamed", { name: entry.title })}
        onClick={() => openForResult(track)}
      >
        <Download />
        {t("charts.request")}
      </Button>
    );
  }
  return null;
}
