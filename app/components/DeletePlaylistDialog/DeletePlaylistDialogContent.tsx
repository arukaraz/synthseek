"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useDeletePlaylist } from "@hooks/api/mutations/playlists/useDeletePlaylist";
import { useTranslation } from "react-i18next";

import type { DeletePlaylistDialogContentProps } from "./types";

export function DeletePlaylistDialogContent({ onOpenChange, playlistId, onDeleted }: DeletePlaylistDialogContentProps) {
  const { t } = useTranslation("library");
  const deletePlaylist = useDeletePlaylist();

  const handleConfirm = () => {
    deletePlaylist.mutate(
      { playlistId },
      {
        onSuccess: () => {
          onOpenChange(false);
          onDeleted?.();
        },
      }
    );
  };

  return (
    <ConfirmationModal
      isOpen
      onClose={() => onOpenChange(false)}
      onConfirm={handleConfirm}
      title={t("playlists.deleteDialog.title")}
      message={t("playlists.deleteDialog.description")}
      confirmText={t("playlists.deleteDialog.confirm")}
      variant="danger"
    />
  );
}
