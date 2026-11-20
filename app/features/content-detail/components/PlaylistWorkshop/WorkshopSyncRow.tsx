"use client";

import { SyncTargetItems } from "@components/SyncToSubmenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { usePlaylistSyncTargets } from "@hooks/api";
import { useSyncPlaylistTo } from "@hooks/api/mutations/requests/useSyncPlaylistTo";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

import { actionRow, actionRowHint, actionRowLabel } from "./styles";
import type { WorkshopSyncRowProps } from "./types";

export function WorkshopSyncRow({ playlistId, excludeServer }: WorkshopSyncRowProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const { data: targets } = usePlaylistSyncTargets();
  const syncPlaylistTo = useSyncPlaylistTo();
  const destinations = (targets ?? []).filter((target) => target.server !== excludeServer);

  const label = syncPlaylistTo.isPending ? tLibrary("playlists.actions.syncing") : tLibrary("playlists.actions.syncTo");

  if (destinations.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={actionRow()} disabled={syncPlaylistTo.isPending}>
        <Upload className="size-4 shrink-0" aria-hidden />
        <span className={actionRowLabel()}>{label}</span>
        <span className={actionRowHint()}>{t("workshop.details.syncToHint")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <SyncTargetItems
          destinations={destinations}
          onSelect={(server) => syncPlaylistTo.mutate({ playlistId, server })}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
