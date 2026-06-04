import type { ReactNode } from "react";
import type { MusicItem } from "@api/__generated__/types";

export interface FlowContextValue {
  openForResult: (result: MusicItem) => void;
}

export interface ContentRequestFlowProps {
  children: ReactNode;
}
