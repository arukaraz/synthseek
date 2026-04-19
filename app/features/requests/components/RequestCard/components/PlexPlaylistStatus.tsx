"use client";

import { IconButton } from "@components/ui/IconButton";
import { cn } from "@utils/cn";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

interface PlexPlaylistStatusProps {
  plexPlaylistId: string | null;
  isPending: boolean;
  onSync: () => void;
}

export function PlexPlaylistStatus({ plexPlaylistId, isPending, onSync }: PlexPlaylistStatusProps) {
  const isSynced = plexPlaylistId !== null;

  const badgeClasses = cn(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
    isSynced ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-fg/15 bg-fg/5 text-fg/50"
  );

  const label = isSynced ? "In Plex" : "Not in Plex";

  return (
    <div className="flex items-center justify-end gap-2" data-cy="plex-playlist-status">
      <span className={badgeClasses} data-cy="plex-playlist-badge" data-synced={isSynced}>
        {isSynced ? <CheckCircle2 className="size-3" /> : null}
        {label}
      </span>
      {!isSynced && (
        <IconButton
          icon={isPending ? Loader2 : Upload}
          variant="primary"
          size="sm"
          aria-label="Create in Plex"
          title="Create in Plex"
          onClick={onSync}
          disabled={isPending}
          className={isPending ? "[&_svg]:animate-spin" : undefined}
          data-cy="plex-playlist-sync-btn"
        />
      )}
    </div>
  );
}
