import type { DetailTarget } from "../../types";

export interface AlbumDetailBodyProps {
  target: DetailTarget;
  onClose: () => void;
  onNavigate: (target: DetailTarget) => void;
  showInLibraryPill?: boolean;
}
