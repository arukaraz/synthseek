"use client";

import { Switch } from "@components/ui/Switch";
import { useLibrarySubscription } from "@hooks/api/queries/spotify/useLibrarySubscription";
import { useUpdateLibrarySubscription } from "@hooks/api/mutations/spotify/useUpdateLibrarySubscription";

import { helperText, watcherPanel, watcherRow } from "../../../styles";

export function WatchLibraryPanel() {
  const { data, isLoading } = useLibrarySubscription();
  const update = useUpdateLibrarySubscription();

  if (isLoading) return null;

  const watchNew = data?.watch_new_playlists ?? false;
  const watchLiked = data?.watch_liked ?? false;
  const watchSaved = data?.watch_saved_albums ?? false;

  return (
    <div className={watcherPanel()}>
      <h3 className="text-fg text-sm font-medium">Watch library for changes</h3>
      <p className={helperText()}>
        New items added in Spotify after enabling will be auto-imported.
      </p>
      <div className={watcherRow()}>
        <label className="text-sm text-fg/80">Watch for new playlists</label>
        <Switch
          checked={watchNew}
          onCheckedChange={(checked) => update.mutate({ watch_new_playlists: Boolean(checked) })}
        />
      </div>
      <div className={watcherRow()}>
        <label className="text-sm text-fg/80">Watch new liked songs</label>
        <Switch
          checked={watchLiked}
          onCheckedChange={(checked) => update.mutate({ watch_liked: Boolean(checked) })}
        />
      </div>
      <div className={watcherRow()}>
        <label className="text-sm text-fg/80">Watch new saved albums</label>
        <Switch
          checked={watchSaved}
          onCheckedChange={(checked) => update.mutate({ watch_saved_albums: Boolean(checked) })}
        />
      </div>
    </div>
  );
}
