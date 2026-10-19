import type { CardSize, MosaicLayout } from "./types";

export const CATEGORIES_LIMIT = 8;

export const SIZE_PATTERN: Record<MosaicLayout, CardSize[]> = {
  pair: ["medium", "small", "medium", "medium", "small", "small", "medium", "small"],
  quad: ["medium", "small", "small", "medium", "medium", "medium", "small", "small"],
};
