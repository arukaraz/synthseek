"use client";

import { DeletePlaylistDialogContent } from "./DeletePlaylistDialogContent";
import type { DeletePlaylistDialogProps } from "./types";

export function DeletePlaylistDialog({ open, onOpenChange, playlistId, onDeleted }: DeletePlaylistDialogProps) {
  if (!open) return null;
  return <DeletePlaylistDialogContent onOpenChange={onOpenChange} playlistId={playlistId} onDeleted={onDeleted} />;
}
