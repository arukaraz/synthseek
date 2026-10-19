import type { BoardSize } from "@hooks/api/queries/board/types";

import { CARD_ROW_LIMITS } from "./constants";

export function cardRowLimit(size: BoardSize): number {
  return size === "M" ? CARD_ROW_LIMITS.half : CARD_ROW_LIMITS.full;
}
