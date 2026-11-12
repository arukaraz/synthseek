import { PlaylistVisibility } from "@api/__generated__/types";
import type { ParseKeys } from "i18next";

import type { SecretSource } from "./types";

export const VISIBILITY_ORDER: readonly PlaylistVisibility[] = [
  PlaylistVisibility.enum.shared,
  PlaylistVisibility.enum.private,
];

export const VISIBILITY_KEYS: Readonly<Record<PlaylistVisibility, ParseKeys<"settings">>> = {
  shared: "privacy.playlists.shared",
  private: "privacy.playlists.private",
};

export const FILTER_THRESHOLD = 5;

export const SECRET_SENTINEL = "••••••••";

export const TYPED_SECRET: SecretSource = { kind: "typed" };

export const DESCRIPTION_INLINE_LIMIT = 70;
