"use client";

import { useTranslation } from "react-i18next";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { trackRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { formatTrackDuration } from "@utils/formatters";

import { CoverArt } from "../WidgetRow/CoverArt";
import { row, rowCopy, rowCover, rowSub, rowTime, rowTitle } from "./styles";
import type { SmartSuggestionRowProps } from "./types";

export function SmartSuggestionRow({ suggestion }: SmartSuggestionRowProps) {
  const { t } = useTranslation("discover");
  const { requestResult } = useContentRequestFlow();
  const suggestionItem = trackRequestItem({
    id: suggestion.catalogTrackId,
    title: suggestion.title,
    artistName: suggestion.artist,
    durationMs: suggestion.durationMs ?? 0,
    trackNumber: 1,
    isrc: suggestion.isrc,
    album: null,
  });

  return (
    <div className={row()}>
      <span className={rowCover()}>
        <CoverArt src={suggestion.cover} seed={suggestion.catalogTrackId} sizes="36px" />
      </span>
      <span className={rowCopy()}>
        <span className={rowTitle()}>{suggestion.title}</span>
        <span className={rowSub()}>{suggestion.artist}</span>
      </span>
      {suggestion.durationMs === null ? null : (
        <span className={rowTime()}>{formatTrackDuration(suggestion.durationMs)}</span>
      )}
      <RequestSplitButton
        name={suggestion.title}
        label={t("smartList.request")}
        size="sm"
        tone="ghost"
        onRequest={() => requestResult(suggestionItem, "direct")}
        onCustomize={() => requestResult(suggestionItem, "customize")}
      />
    </div>
  );
}
