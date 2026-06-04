import type { ReactNode } from "react";
import type { MusicItem } from "@api/__generated__/types";
import type { ConfigRequestMode } from "../ConfigRequestModal/types";

export interface FlowState {
  selectedResult: MusicItem | null;
  showContentBrowserModal: boolean;
  showConfigRequestModal: boolean;
  selectedContentToRequest: MusicItem | null;
  parentAlbumFromContext: MusicItem | null;
  configRequestMode: ConfigRequestMode;
}

export interface FlowContextValue {
  openForResult: (result: MusicItem) => void;
}

export interface ContentRequestFlowProps {
  children: ReactNode;
}
