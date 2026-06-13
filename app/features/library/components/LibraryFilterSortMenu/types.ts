import type { LibraryUrlController } from "../../hooks/useLibraryUrlState";

export interface LibraryFilterSortMenuProps {
  controller: LibraryUrlController;
  onViewChange: (view: LibraryUrlController["view"]) => void;
}
