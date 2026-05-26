"use client";

import { Boxes, Link as LinkIcon, Radio, Server, Tags } from "lucide-react";
import type { ReactNode } from "react";

import { IntegrationTabs } from "@features/settings/components/IntegrationTabs";
import { SettingsPageHeader } from "@features/settings/components/SettingsPageHeader";
import { contentRoot } from "@features/settings/styles";

const TABS = [
  { href: "/settings/integrations/slskd", label: "Slskd", icon: Server },
  { href: "/settings/integrations/plex", label: "Plex", icon: Boxes },
  { href: "/settings/integrations/lastfm", label: "Last.fm", icon: Radio },
  { href: "/settings/integrations/metadata", label: "Metadata", icon: Tags },
  { href: "/settings/integrations/songlink", label: "Songlink", icon: LinkIcon },
] as const;

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Integrations" />
      <IntegrationTabs items={TABS} />
      {children}
    </div>
  );
}
