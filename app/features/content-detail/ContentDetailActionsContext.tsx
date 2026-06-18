"use client";

import { createContext, useContext } from "react";

import type { ContentDetailActions, ContentDetailActionsProviderProps } from "./types";

const ContentDetailActionsContext = createContext<ContentDetailActions | null>(null);

export function useContentDetailActions(): ContentDetailActions {
  const ctx = useContext(ContentDetailActionsContext);
  if (!ctx) throw new Error("useContentDetailActions must be used within ContentDetailActionsProvider");
  return ctx;
}

export function ContentDetailActionsProvider({ actions, children }: ContentDetailActionsProviderProps) {
  return <ContentDetailActionsContext.Provider value={actions}>{children}</ContentDetailActionsContext.Provider>;
}
