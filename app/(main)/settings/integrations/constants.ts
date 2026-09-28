import type { ParseKeys } from "i18next";
import { Download, Import, Server, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const TAB_DEFINITIONS: ReadonlyArray<{ href: string; labelKey: ParseKeys<"appShell">; icon: LucideIcon }> = [
  {
    href: "/settings/integrations/download-sources",
    labelKey: "appShell.settings.integrations.tabs.downloadSources",
    icon: Download,
  },
  {
    href: "/settings/integrations/media-servers",
    labelKey: "appShell.settings.integrations.tabs.mediaServers",
    icon: Server,
  },
  {
    href: "/settings/integrations/library-sources",
    labelKey: "appShell.settings.integrations.tabs.librarySources",
    icon: Import,
  },
  { href: "/settings/integrations/metadata", labelKey: "appShell.settings.integrations.tabs.metadata", icon: Tags },
];
