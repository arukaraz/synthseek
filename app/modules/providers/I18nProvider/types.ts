import type { ReactNode } from "react";

import type { Locale } from "@locale/config";

export interface I18nProviderProps {
  locale: Locale;
  children: ReactNode;
}
