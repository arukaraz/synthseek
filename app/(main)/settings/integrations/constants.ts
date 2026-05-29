import { Boxes, Server, Tags } from "lucide-react";

export const TABS = [
  { href: "/settings/integrations/slskd", label: "Slskd", icon: Server },
  { href: "/settings/integrations/plex", label: "Plex", icon: Boxes },
  { href: "/settings/integrations/metadata", label: "Metadata", icon: Tags },
] as const;
