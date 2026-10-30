import i18n from "@locale";

import type { BoardSize } from "@hooks/api/queries/board/types";

import { CARD_FIT, CARD_ROW_LIMITS } from "./constants";
import type { WidgetListColumns } from "./WidgetRow/types";

export function cardRowLimit(size: BoardSize): number {
  return size === "L" ? CARD_ROW_LIMITS.full : CARD_ROW_LIMITS.half;
}

export function listColumns(size: BoardSize): WidgetListColumns {
  return size === "L" ? "two" : "one";
}

export function cardRowFit(width: number, size: BoardSize): number {
  const fits = Math.floor((width + CARD_FIT.GAP_PX) / (CARD_FIT.MIN_WIDTH_PX + CARD_FIT.GAP_PX));
  return Math.min(CARD_FIT.CAPS[size], Math.max(CARD_FIT.MIN_COLUMNS, fits));
}

export function compactCount(value: number): string {
  return new Intl.NumberFormat(i18n.language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function percentOf(share: number): string {
  return new Intl.NumberFormat(i18n.language, { style: "percent", maximumFractionDigits: 0 }).format(share);
}
