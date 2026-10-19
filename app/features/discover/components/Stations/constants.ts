import type { ParseKeys } from "i18next";

import type { Station } from "@hooks/api/queries/analytics/types";

import type { PlaySetAccent } from "../PlaySetCard/types";

export const STATION_TAG_KEYS: Record<Station["kind"], ParseKeys<"discover">> = {
  artist: "stations.kind.artist",
  favorites: "stations.kind.favorites",
  unplayed: "stations.kind.unplayed",
};

export const STATION_TITLE_KEYS: Record<Exclude<Station["kind"], "artist">, ParseKeys<"discover">> = {
  favorites: "stations.title.favorites",
  unplayed: "stations.title.unplayed",
};

export const STATION_ACCENTS: Record<Station["kind"], PlaySetAccent> = {
  artist: "explore",
  favorites: "cf",
  unplayed: "daily",
};
