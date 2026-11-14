import { SIZE_PATTERN } from "./constants";
import { mosaicSlotClasses } from "./styles";
import type { CardSize } from "./types";

export function getCardSize(index: number): CardSize {
  return SIZE_PATTERN[index] ?? "small";
}

export function mosaicSlotClass(index: number): string {
  return mosaicSlotClasses[index] ?? "";
}
