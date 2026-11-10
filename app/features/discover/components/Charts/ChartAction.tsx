"use client";

import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { Button } from "@components/ui/Button";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { widgetRowButton } from "../WidgetRow/styles";
import type { ChartActionProps } from "./types";

export function ChartAction({ entry }: ChartActionProps) {
  const { t } = useTranslation("discover");
  const { requestResult } = useContentRequestFlow();
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
      <RequestSplitButton
        name={entry.title}
        label={t("charts.request")}
        size="sm"
        onRequest={() => requestResult(track, "direct")}
        onCustomize={() => requestResult(track, "customize")}
      />
    );
  }
  return null;
}
