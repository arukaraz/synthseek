import { BOARD_WIDE_QUERY, type BoardDevice } from "@components/BoardGrid";

import { useMediaQuery } from "../useMediaQuery";

export function useBoardDevice(): BoardDevice {
  return useMediaQuery(BOARD_WIDE_QUERY, true) ? "wide" : "narrow";
}
