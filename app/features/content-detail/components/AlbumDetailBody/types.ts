import type { DetailTarget } from "../../types";

export interface AlbumDetailBodyProps {
  target: DetailTarget;
  onNavigate: (target: DetailTarget) => void;
}
