import type { ParseKeys } from "i18next";
import { Boxes, Download, Library, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const TAB_DEFINITIONS: ReadonlyArray<{ href: string; labelKey: ParseKeys<"appShell">; icon: LucideIcon }> = [
  {
    href: "/settings/integrations/download-sources",
    labelKey: "appShell.settings.integrations.tabs.downloadSources",
    icon: Download,
  },
  { href: "/settings/integrations/plex", labelKey: "appShell.settings.integrations.tabs.plex", icon: Boxes },
  { href: "/settings/integrations/lidarr", labelKey: "appShell.settings.integrations.tabs.lidarr", icon: Library },
  { href: "/settings/integrations/metadata", labelKey: "appShell.settings.integrations.tabs.metadata", icon: Tags },
];
