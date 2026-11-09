"use client";

import { createContext, useContext } from "react";

import type { ContentDetailCloseProviderProps } from "./types";

const ContentDetailCloseContext = createContext<(() => void) | null>(null);

export function useContentDetailClose(): () => void {
  const close = useContext(ContentDetailCloseContext);
  if (!close) throw new Error("useContentDetailClose must be used within ContentDetailCloseProvider");
  return close;
}

export function ContentDetailCloseProvider({ onClose, children }: ContentDetailCloseProviderProps) {
  return <ContentDetailCloseContext.Provider value={onClose}>{children}</ContentDetailCloseContext.Provider>;
}
