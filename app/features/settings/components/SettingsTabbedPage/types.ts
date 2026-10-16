import type { ReactNode } from "react";

import type { SettingsTabbedPageId } from "../../types";

export interface SettingsTabbedPageProps {
  pageId: SettingsTabbedPageId;
  children: ReactNode;
}
