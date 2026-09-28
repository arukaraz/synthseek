import type { AppRouter } from "@api/__generated__/types";
import { capitalize } from "@utils/string";
import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";

export type PlaylistOrigin = inferRouterOutputs<AppRouter>["library"]["getPlaylists"]["items"][number]["origin"];

type DiscoveryServiceKey = NonNullable<Extract<PlaylistOrigin, { kind: "discovery" }>["service"]>;

export const DISCOVERY_SERVICE_NAMES = {
  listenbrainz: "ListenBrainz",
  lastfm: "Last.fm",
} as const satisfies Record<DiscoveryServiceKey, string>;

interface PlaylistOriginOptions {
  withProvider?: boolean;
}

export function playlistOriginLabel(
  origin: PlaylistOrigin,
  t: TFunction<"library">,
  options: PlaylistOriginOptions = {}
): string {
  switch (origin.kind) {
    case "imported":
      return options.withProvider
        ? t("playlists.origin.imported", { provider: capitalize(origin.provider) })
        : t("page.origin.imported");
    case "created":
      return t("page.origin.createdInSynthseek");
    case "catalog":
      return t("page.origin.requestedFrom", { provider: capitalize(origin.provider) });
    case "discovery":
      return origin.service === null
        ? t("page.origin.fromDiscovery")
        : t("page.origin.fromService", { service: DISCOVERY_SERVICE_NAMES[origin.service] });
    case "file":
      return t("page.origin.importedFromFile");
  }
}
