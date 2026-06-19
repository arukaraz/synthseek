"use client";

import { RenamePlaylistDialogContent } from "./RenamePlaylistDialogContent";
import type { RenamePlaylistDialogProps } from "./types";

export function RenamePlaylistDialog({ open, onOpenChange, playlistId, currentName }: RenamePlaylistDialogProps) {
  if (!open) return null;
  return <RenamePlaylistDialogContent onOpenChange={onOpenChange} playlistId={playlistId} currentName={currentName} />;
}
