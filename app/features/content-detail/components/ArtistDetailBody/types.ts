import type { DetailTarget } from "../../types";

export interface ArtistDetailBodyProps {
  target: DetailTarget;
  onClose: () => void;
  onNavigate: (target: DetailTarget) => void;
}
