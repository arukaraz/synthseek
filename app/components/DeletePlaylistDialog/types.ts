export interface DeletePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  onDeleted?: () => void;
}

export type DeletePlaylistDialogContentProps = Omit<DeletePlaylistDialogProps, "open">;
