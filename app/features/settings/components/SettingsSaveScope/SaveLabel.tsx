"use client";

import { createContext, useContext } from "react";

import type { SaveLabelProviderProps } from "./types";

const SaveLabelContext = createContext<string | null>(null);

export function useSaveLabel(): string | null {
  return useContext(SaveLabelContext);
}

export function SaveLabelProvider({ label, children }: SaveLabelProviderProps) {
  return <SaveLabelContext.Provider value={label}>{children}</SaveLabelContext.Provider>;
}
