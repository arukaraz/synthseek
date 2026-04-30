import type { MusicItem } from "@api/__generated__/types";

export function getItemImage(item: MusicItem): string | undefined {
  if ("images" in item) return item.images?.[0]?.url;
  return undefined;
}
