"use client";

import { createContext, useContext } from "react";
import { createPortal } from "react-dom";

import { bottomDockContent } from "./styles";
import type { DockedToBottomProps, SettingsBottomDockProviderProps } from "./types";

const SettingsBottomDockContext = createContext<HTMLElement | null>(null);

export function SettingsBottomDockProvider({ dock, children }: SettingsBottomDockProviderProps) {
  return <SettingsBottomDockContext.Provider value={dock}>{children}</SettingsBottomDockContext.Provider>;
}

export function DockedToBottom({ children }: DockedToBottomProps) {
  const dock = useContext(SettingsBottomDockContext);
  if (dock === null) return <>{children}</>;
  return createPortal(<div className={bottomDockContent()}>{children}</div>, dock);
}
