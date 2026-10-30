"use client";

import { useTranslation } from "react-i18next";

import { CustomWidget } from "../CustomWidget/CustomWidget";
import { BOARD_WIDGETS } from "./constants";
import type { BoardTileWidgetProps } from "./types";

export function BoardTileWidget({ item, size, custom, customStatus, info = true }: BoardTileWidgetProps) {
  const { t } = useTranslation("discover");

  if (item.kind === "custom") {
    return <CustomWidget widget={custom.get(item.widgetId) ?? null} status={customStatus} size={size} />;
  }
  const { component: Widget, descriptionKey } = BOARD_WIDGETS[item.widget];
  return <Widget size={size} info={info ? t(descriptionKey) : ""} />;
}
