import type { ReactNode } from "react";
import type { MusicItem } from "@api/__generated__/types";

export interface FlowState {
  selectedResult: MusicItem | null;
  showContentBrowserModal: boolean;
  showConfigRequestModal: boolean;
  selectedContentToRequest: MusicItem | null;
  parentAlbumFromContext: MusicItem | null;
}

export interface FlowContextValue {
  openForResult: (result: MusicItem) => void;
}

export interface ContentRequestFlowProps {
  children: ReactNode;
}
