import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs } from "@trpc/server";

import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

type LibrarySourceKey = inferRouterInputs<AppRouter>["librarySource"]["provider"]["items"]["provider"];

export const LIBRARY_SOURCE_NAMES = {
  spotify: "Spotify",
  ...PLAYBACK_SERVER_NAMES,
} as const satisfies Record<LibrarySourceKey, string>;

const NAMES = new Map<string, string>(Object.entries(LIBRARY_SOURCE_NAMES));

export function librarySourceName(key: string | null | undefined): string | null {
  if (!key) return null;
  return NAMES.get(key) ?? null;
}
