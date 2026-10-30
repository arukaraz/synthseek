"use client";

import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";

import { CustomWidget } from "../CustomWidget/CustomWidget";
import { BOARD_WIDGETS } from "./constants";
import type { BoardTileContentProps } from "./types";

export function BoardTileContent({ item, size, custom, customStatus, info }: BoardTileContentProps) {
  const { t } = useTranslation("discover");

  if (item.kind === "spacer") return <div className={glassPanelCard()} aria-hidden />;
  if (item.kind === "custom") {
    return <CustomWidget widget={custom.get(item.widgetId) ?? null} status={customStatus} size={size} />;
  }
  const { component: Widget, descriptionKey } = BOARD_WIDGETS[item.widget];
  return <Widget size={size} info={info ? t(descriptionKey) : ""} />;
}
