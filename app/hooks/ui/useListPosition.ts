import { createContext, useContext } from "react";

import type { ListPosition } from "@utils/list-position";

export const ListPositionContext = createContext<ListPosition | undefined>(undefined);

export function useListPosition(): ListPosition | undefined {
  return useContext(ListPositionContext);
}
