import { Blocks, FileText, ListOrdered, Settings2, Timer, User, Users } from "lucide-react";
import type { NavItem } from "./types";

export const TOP_LEVEL: NavItem[] = [
  { href: "/settings/general", label: "General", icon: <Settings2 /> },
  { href: "/settings/members", label: "Members", icon: <Users />, adminOnly: true },
  { href: "/settings/profile", label: "Profile", icon: <User /> },
];

export const ADVANCED_ITEMS: NavItem[] = [
  { href: "/settings/integrations", label: "Integrations", icon: <Blocks />, adminOnly: true },
  { href: "/settings/engine", label: "Engine", icon: <ListOrdered />, adminOnly: true },
  { href: "/settings/jobs", label: "Jobs", icon: <Timer />, adminOnly: true },
  { href: "/settings/logs", label: "Logs", icon: <FileText />, adminOnly: true },
];

export const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
