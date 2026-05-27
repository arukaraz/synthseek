import { SIZE_PATTERN } from "./constants";
import type { CardSize } from "./types";

export function getCardSize(index: number): CardSize {
  return SIZE_PATTERN[index] ?? "small";
}
