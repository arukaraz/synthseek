"use client";

import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { RenamePlaylistDialog } from "@components/RenamePlaylistDialog";
import { SmartRuleDialog } from "@features/discover";
import { useSetPlaylistVisibility } from "@hooks/api/mutations/playlists/useSetPlaylistVisibility";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { Lock, Pencil, Trash2, Users, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { LibraryMenuAction } from "../../types";
import { LibraryActionMenu } from "../LibraryActionMenu";
import { shieldOwnClick } from "./helpers";
import { cardInlineKebab } from "./styles";
import type { PlaylistCardMenuProps } from "./types";

export function PlaylistCardMenu({ item }: PlaylistCardMenuProps) {
  const { t } = useTranslation("library");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);

  const { currentUser } = useAuthContext();
  const setVisibility = useSetPlaylistVisibility();

  const canEdit = item.source_provider == null || !item.sync_enabled;
  const canShare = isOwnerOrAdminFE({ id: item.owner_id }, currentUser);
  const isPrivate = item.visibility === "private";
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
      key: "visibility",
      icon: isPrivate ? Users : Lock,
      label: t(isPrivate ? "playlists.actions.makeShared" : "playlists.actions.makePrivate"),
      onSelect: () => setVisibility.mutate({ playlistId: item.id, visibility: isPrivate ? "shared" : "private" }),
      disabled: !canShare,
      hint: canShare ? undefined : t("playlists.actions.ownerOnly"),
    },
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
        triggerClassName={cardInlineKebab()}
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
