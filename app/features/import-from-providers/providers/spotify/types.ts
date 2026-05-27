import type { SpotifyImportState } from "./hooks/useSpotifyImportState";

export interface SpotifyPanelProps {
  state: SpotifyImportState;
  onClose: () => void;
}
