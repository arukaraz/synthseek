"use client";

import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { RenamePlaylistDialog } from "@components/RenamePlaylistDialog";
import { SmartRuleDialog } from "@features/discover";
import { Pencil, Trash2, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { LibraryMenuAction } from "../../types";
import { LibraryActionMenu } from "../LibraryActionMenu";
import { shieldOwnClick } from "./helpers";
import { cardInlineKebab, cardKebab } from "./styles";
import type { PlaylistCardMenuProps } from "./types";

export function PlaylistCardMenu({ item, appearance = "cover" }: PlaylistCardMenuProps) {
  const { t } = useTranslation("library");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);

  const canEdit = item.source_provider == null || !item.sync_enabled;
  const actions: LibraryMenuAction[] = [
    {
      key: "rename",
      icon: Pencil,
      label: t("playlists.actions.rename"),
      onSelect: () => setRenameOpen(true),
      disabled: !canEdit,
    },
    ...(item.smart
      ? [
          {
            key: "rule",
            icon: WandSparkles,
            label: t("playlists.actions.editRule"),
            onSelect: () => setRuleOpen(true),
          },
        ]
      : []),
    {
      key: "delete",
      icon: Trash2,
      label: t("playlists.actions.delete"),
      onSelect: () => setDeleteOpen(true),
      tone: "danger",
    },
  ];

  return (
    <div onClick={shieldOwnClick} onKeyDown={(event) => event.stopPropagation()}>
      <LibraryActionMenu
        title={item.name}
        triggerLabel={t("playlists.actions.menu", { name: item.name })}
        triggerClassName={appearance === "inline" ? cardInlineKebab() : cardKebab()}
        actions={actions}
      />
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
