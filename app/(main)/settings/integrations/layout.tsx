"use client";

import { Boxes, Fingerprint, Image, Link as LinkIcon, Music, Radio, Server } from "lucide-react";
import type { ReactNode } from "react";

import { IntegrationTabs } from "@features/settings/components/IntegrationTabs";
import { SettingsPageHeader } from "@features/settings/components/SettingsPageHeader";
import { contentRoot } from "@features/settings/styles";

const TABS = [
  { href: "/settings/integrations/slskd", label: "Slskd", icon: Server },
  { href: "/settings/integrations/plex", label: "Plex", icon: Boxes },
  { href: "/settings/integrations/lastfm", label: "Last.fm", icon: Radio },
  { href: "/settings/integrations/fanart", label: "FanART", icon: Image },
  { href: "/settings/integrations/songlink", label: "Songlink", icon: LinkIcon },
  { href: "/settings/integrations/acoustid", label: "AcoustID", icon: Fingerprint },
  { href: "/settings/integrations/musicbrainz", label: "MusicBrainz", icon: Music },
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
