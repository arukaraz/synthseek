import { ArrowUpCircle, Blocks, FileText, ListOrdered, Settings2, Timer, User, Users } from "lucide-react";
import type { NavItem } from "./types";

export const TOP_LEVEL: NavItem[] = [
  { href: "/settings/general", labelKey: "shell.sidebar.items.general", icon: <Settings2 /> },
  { href: "/settings/members", labelKey: "shell.sidebar.items.members", icon: <Users />, adminOnly: true },
  { href: "/settings/profile", labelKey: "shell.sidebar.items.profile", icon: <User /> },
  { href: "/settings/updates", labelKey: "shell.sidebar.items.updates", icon: <ArrowUpCircle /> },
];

export const ADVANCED_ITEMS: NavItem[] = [
  { href: "/settings/integrations", labelKey: "shell.sidebar.items.integrations", icon: <Blocks />, adminOnly: true },
  { href: "/settings/engine", labelKey: "shell.sidebar.items.engine", icon: <ListOrdered />, adminOnly: true },
  { href: "/settings/jobs", labelKey: "shell.sidebar.items.jobs", icon: <Timer />, adminOnly: true },
  { href: "/settings/logs", labelKey: "shell.sidebar.items.logs", icon: <FileText />, adminOnly: true },
];

export const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
