"use client";

import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { RenamePlaylistDialog } from "@components/RenamePlaylistDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { SmartRuleDialog } from "@features/discover";
import { MoreVertical, Pencil, Trash2, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { libraryMenuItem, libraryMenuItemDanger } from "../../styles";
import { cardKebab } from "./styles";
import type { PlaylistCardMenuProps } from "./types";

export function PlaylistCardMenu({ item }: PlaylistCardMenuProps) {
  const { t } = useTranslation("library");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);

  const canEdit = item.source_provider == null || !item.sync_enabled;

  return (
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger className={cardKebab()} aria-label={t("playlists.actions.menu", { name: item.name })}>
          <MoreVertical className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className={libraryMenuItem()} disabled={!canEdit} onSelect={() => setRenameOpen(true)}>
            <Pencil className="size-4" aria-hidden />
            {t("playlists.actions.rename")}
          </DropdownMenuItem>
          {item.smart ? (
            <DropdownMenuItem className={libraryMenuItem()} onSelect={() => setRuleOpen(true)}>
              <WandSparkles className="size-4" aria-hidden />
              {t("playlists.actions.editRule")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem className={libraryMenuItemDanger()} onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" aria-hidden />
            {t("playlists.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenamePlaylistDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        playlistId={item.id}
        currentName={item.name}
      />
      <DeletePlaylistDialog open={deleteOpen} onOpenChange={setDeleteOpen} playlistId={item.id} />
      {ruleOpen ? <SmartRuleDialog open={ruleOpen} onOpenChange={setRuleOpen} playlistId={item.id} /> : null}
    </div>
  );
}
