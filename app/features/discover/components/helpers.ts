import i18n from "@locale";

import type { BoardSize } from "@hooks/api/queries/board/types";

import { CARD_ROW_LIMITS } from "./constants";

export function cardRowLimit(size: BoardSize): number {
  return size === "M" ? CARD_ROW_LIMITS.half : CARD_ROW_LIMITS.full;
}

export function compactCount(value: number): string {
  return new Intl.NumberFormat(i18n.language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function percentOf(share: number): string {
  return new Intl.NumberFormat(i18n.language, { style: "percent", maximumFractionDigits: 0 }).format(share);
}
