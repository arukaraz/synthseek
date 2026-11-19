export interface FollowControlProps {
  catalogArtistId: string;
  artistName: string;
}

export interface FollowLabelProps {
  live: "follow" | "following";
}

export interface FollowPopoverBodyProps {
  showTitle?: boolean;
  catalogArtistId: string;
  artistName: string;
  autoRequest: boolean;
  onClose: () => void;
  fullWidthDone?: boolean;
}
