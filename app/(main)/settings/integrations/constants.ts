import { Boxes, Link as LinkIcon, Radio, Server, Tags } from "lucide-react";

export const TABS = [
  { href: "/settings/integrations/slskd", label: "Slskd", icon: Server },
  { href: "/settings/integrations/plex", label: "Plex", icon: Boxes },
  { href: "/settings/integrations/lastfm", label: "Last.fm", icon: Radio },
  { href: "/settings/integrations/metadata", label: "Metadata", icon: Tags },
  { href: "/settings/integrations/songlink", label: "Songlink", icon: LinkIcon },
] as const;
