import { createContext, useContext } from "react";

export const SettingsFieldLabelContext = createContext<string | null>(null);

export function useSettingsFieldLabelId(): string | null {
  return useContext(SettingsFieldLabelContext);
}
