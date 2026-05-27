export interface PlaylistsTabProps {
  selected: ReadonlySet<string>;
  sync: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleSync: (id: string) => void;
}

export interface LikedSongsTabProps {
  imported: boolean;
  enableSync: boolean;
  onToggleImport: (value: boolean) => void;
  onToggleSync: (value: boolean) => void;
}

export interface SavedAlbumsTabProps {
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

export interface ConnectGateProps {
  configured: boolean;
  isAdmin: boolean;
  pending: boolean;
  onClose: () => void;
}
