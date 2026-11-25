import { WARMING_REFETCH_MS } from "./constants";
import type { WidgetResult } from "./types";

export function isWarming(result: WidgetResult | undefined): boolean {
  if (result?.type !== "feed") return false;
  switch (result.dataset) {
    case "tracks":
    case "albums":
    case "artists":
      return result.warming;
    case "items":
    case "events":
    case "playlists":
      return false;
  }
}

export function warmingRefetch(query: { state: { data: WidgetResult | undefined } }): number | false {
  return isWarming(query.state.data) ? WARMING_REFETCH_MS : false;
}
