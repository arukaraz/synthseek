import { capitalize } from "@utils/string";
import type { TFunction } from "i18next";

interface PlaylistOriginOptions {
  withProvider?: boolean;
}

export function playlistOriginLabel(
  sourceProvider: string | null | undefined,
  t: TFunction<"library">,
  options: PlaylistOriginOptions = {}
): string {
  if (!sourceProvider) return t("page.origin.createdHere");
  if (options.withProvider) return t("playlists.origin.imported", { provider: capitalize(sourceProvider) });
  return t("page.origin.imported");
}
