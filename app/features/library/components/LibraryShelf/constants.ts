import { Grid2x2, Grid3x3, List } from "lucide-react";

import type { ShelfLayoutOption } from "./types";

export const SHELF_LAYOUTS: readonly ShelfLayoutOption[] = [
  { value: "comfortable", Icon: Grid2x2 },
  { value: "compact", Icon: Grid3x3 },
  { value: "list", Icon: List },
];
