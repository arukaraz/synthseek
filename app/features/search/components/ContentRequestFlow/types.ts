import type { ReactNode } from "react";
import type { MusicItem } from "@api/__generated__/types";
import type { DetailTarget, RequestIntent } from "@features/content-detail";

export interface FlowContextValue {
  openForResult: (result: MusicItem) => void;
  openForTarget: (target: DetailTarget) => void;
  requestResult: (result: MusicItem, intent?: RequestIntent) => void;
}

export interface ContentRequestFlowProps {
  children: ReactNode;
}
