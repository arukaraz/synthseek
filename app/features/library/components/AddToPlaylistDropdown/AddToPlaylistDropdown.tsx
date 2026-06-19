"use client";

import { IconButton } from "@components/ui/IconButton";
import { Input } from "@components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Spinner } from "@components/ui/Spinner";
import { useAddTracksToPlaylist } from "@hooks/api/mutations/playlists/useAddTracksToPlaylist";
import { useCreatePlaylist } from "@hooks/api/mutations/playlists/useCreatePlaylist";
import { useLibraryPlaylists } from "@hooks/api/queries/library/useLibraryPlaylists";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { EDITABLE_PLAYLISTS_INPUT } from "./constants";
import { isEditablePlaylist } from "./helpers";
import {
  dropdownContent,
  emptyState,
  footer,
  loadingRow,
  separator,
  playlistItem,
  playlistItemCount,
  playlistItemName,
  scrollList,
} from "./styles";
import type { AddToPlaylistDropdownProps } from "./types";

export function AddToPlaylistDropdown({ trackIds, onDone, trigger }: AddToPlaylistDropdownProps) {
  const { t } = useTranslation("library");
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const playlists = useLibraryPlaylists(EDITABLE_PLAYLISTS_INPUT, open);
  const addTracks = useAddTracksToPlaylist();
  const createPlaylist = useCreatePlaylist();

  const editable = (playlists.items ?? []).filter(isEditablePlaylist);
  const isBusy = addTracks.isPending || createPlaylist.isPending;

  const finish = () => {
    setOpen(false);
    setNewName("");
    onDone();
  };

  const handleAdd = (playlistId: string) => {
    addTracks.mutate({ playlistId, trackIds }, { onSuccess: finish });
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createPlaylist.mutate({ name, trackIds }, { onSuccess: finish });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent align="end" className={dropdownContent()}>
        <div className={scrollList()}>
          {playlists.isLoading ? (
            <div className={loadingRow()}>
              <Spinner size="sm" />
            </div>
          ) : editable.length === 0 ? (
            <p className={emptyState()}>{t("playlists.dropdown.empty")}</p>
          ) : (
            editable.map((item) => (
              <button
                key={item.id}
                type="button"
                className={playlistItem()}
                onClick={() => handleAdd(item.id)}
                disabled={isBusy}
              >
                <span className={playlistItemName()}>{item.name}</span>
                <span className={playlistItemCount()}>{item.total_tracks}</span>
              </button>
            ))
          )}
        </div>

        <div className={separator()} />

        <div className={footer()}>
          <Input
            size="sm"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCreate();
            }}
            placeholder={t("playlists.dropdown.newPlaceholder")}
            disabled={isBusy}
            aria-label={t("playlists.dropdown.newPlaceholder")}
          />
          <IconButton
            icon={Plus}
            size="sm"
            variant="primary"
            onClick={handleCreate}
            disabled={isBusy || newName.trim().length === 0}
            aria-label={t("playlists.dropdown.create")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
