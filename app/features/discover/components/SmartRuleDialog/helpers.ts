import type { WidgetDraft, WidgetRuleOfPlaylist } from "@hooks/api/queries/widgets/types";

import { NEW_WIDGET_DRAFT } from "../../constants";

export function ruleDraftOf(rule: WidgetRuleOfPlaylist, playlistId: string): WidgetDraft {
  return {
    ...NEW_WIDGET_DRAFT,
    meta: { ...NEW_WIDGET_DRAFT.meta, name: rule.name, icon: "list-music" },
    query: rule.query,
    playlist: { refresh: rule.refresh, playlistId },
  };
}
