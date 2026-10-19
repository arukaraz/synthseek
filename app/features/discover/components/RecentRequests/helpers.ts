import type { BoardSize } from "@hooks/api/queries/board/types";

import type { RequestCardLayout } from "./types";

export function requestLayoutFor(size: BoardSize): RequestCardLayout {
  return size === "M" ? "row" : "tile";
}
