import type { BoardSize } from "@hooks/api/queries/board/types";

import { SIZE_PATTERN } from "./constants";
import type { CardSize, MosaicLayout } from "./types";

export function mosaicLayoutFor(size: BoardSize): MosaicLayout {
  return size === "XL" ? "quad" : "pair";
}

export function getCardSize(index: number, layout: MosaicLayout): CardSize {
  return SIZE_PATTERN[layout][index] ?? "small";
}
