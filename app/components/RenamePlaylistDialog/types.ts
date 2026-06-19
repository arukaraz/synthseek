export interface RenamePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  currentName: string;
}

export type RenamePlaylistDialogContentProps = Omit<RenamePlaylistDialogProps, "open">;
