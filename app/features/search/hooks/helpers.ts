import { ContentType } from "@api/__generated__/types";

import type { DirectRequestTarget } from "./types";

export function needsConfirmation(target: DirectRequestTarget): boolean {
  return target.mode === "artist-tracks" || target.item.type === ContentType.enum.playlist;
}
