import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";

export interface SessionConnectFormProps {
  source: LibrarySourceDescription;
  reconnect?: boolean;
  onConnected?: () => void;
}
