"use client";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { useRenamePlaylist } from "@hooks/api/mutations/playlists/useRenamePlaylist";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { renameFooter, renameForm } from "./styles";
import type { RenamePlaylistDialogContentProps } from "./types";

export function RenamePlaylistDialogContent({
  onOpenChange,
  playlistId,
  currentName,
}: RenamePlaylistDialogContentProps) {
  const { t } = useTranslation("library");
  const renamePlaylist = useRenamePlaylist();
  const [name, setName] = useState(currentName);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== currentName && !renamePlaylist.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    renamePlaylist.mutate({ playlistId, name: trimmed }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("playlists.renameDialog.title")}</DialogTitle>
        </DialogHeader>

        <form className={renameForm()} onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("playlists.renameDialog.placeholder")}
            aria-label={t("playlists.renameDialog.placeholder")}
            maxLength={200}
            autoFocus
          />
          <div className={renameFooter()}>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("playlists.renameDialog.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {t("playlists.renameDialog.confirm")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
