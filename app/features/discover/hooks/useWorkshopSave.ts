import { useSaveSmartPlaylist } from "@hooks/api/mutations/widgets/useSaveSmartPlaylist";
import { useSaveWidget } from "@hooks/api/mutations/widgets/useSaveWidget";
import type { WidgetDraft } from "@hooks/api/queries/widgets/types";

import type { WidgetWorkshopState, WorkshopSave } from "../components/WidgetWorkshop/types";

export function useWorkshopSave(
  workshop: WidgetWorkshopState,
  timeZone: string,
  onSaved: (name: string) => void
): WorkshopSave {
  const saveWidget = useSaveWidget();
  const savePlaylist = useSaveSmartPlaylist();
  const { draft, widgetId, purpose, playlistable, linkPlaylist } = workshop;
  const named = draft.meta.name.trim().length > 0;
  const ruleReady = purpose === "widget" || (playlistable && draft.playlist !== null);

  const storeWidget = (next: WidgetDraft) =>
    saveWidget.mutate(widgetId ? { ...next, id: widgetId } : next, { onSuccess: (saved) => onSaved(saved.meta.name) });

  const save = () => {
    const { query, playlist } = draft;
    if (!playlist || query.type !== "question") {
      storeWidget(draft);
      return;
    }
    savePlaylist.mutate(
      { playlistId: playlist.playlistId, name: draft.meta.name, refresh: playlist.refresh, timeZone, query },
      {
        onSuccess: (stored) => {
          linkPlaylist(stored.id);
          if (purpose === "rule") onSaved(stored.name);
          else storeWidget({ ...draft, playlist: { ...playlist, playlistId: stored.id } });
        },
      }
    );
  };

  return { save, pending: saveWidget.isPending || savePlaylist.isPending, ready: named && ruleReady };
}
