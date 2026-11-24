import type { FeedIntegration } from "./types";
import { useWidgetCatalog } from "./useWidgetCatalog";

export function useActiveIntegrations(): readonly FeedIntegration[] | undefined {
  return useWidgetCatalog().data?.feeds.activeIntegrations;
}
