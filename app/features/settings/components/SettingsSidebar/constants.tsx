import { Blocks, FileText, ListOrdered, Settings2, User, Users } from "lucide-react";
import type { NavItem } from "./types";

export const TOP_LEVEL: NavItem[] = [
  { href: "/settings/general", label: "General", icon: <Settings2 /> },
  { href: "/settings/members", label: "Members", icon: <Users /> },
  { href: "/settings/profile", label: "Profile", icon: <User /> },
];

export const ADVANCED_ITEMS: NavItem[] = [
  { href: "/settings/integrations", label: "Integrations", icon: <Blocks /> },
  { href: "/settings/engine", label: "Engine", icon: <ListOrdered /> },
  { href: "/settings/logs", label: "Logs", icon: <FileText /> },
];

export const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
