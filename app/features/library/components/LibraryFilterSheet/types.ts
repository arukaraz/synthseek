import type { LibraryFilterSidebarProps } from "../LibraryFilterSidebar/types";

export interface LibraryFilterSheetProps extends LibraryFilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
