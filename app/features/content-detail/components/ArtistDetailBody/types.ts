import type { DetailTarget } from "../../types";

export interface ArtistDetailBodyProps {
  target: DetailTarget;
  onNavigate: (target: DetailTarget) => void;
}
