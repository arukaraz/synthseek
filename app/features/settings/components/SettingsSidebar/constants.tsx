import {
  ArrowUpCircle,
  Blocks,
  CopyCheck,
  FileText,
  Inbox,
  ListOrdered,
  Settings2,
  ShieldBan,
  Timer,
  Trash2,
  User,
  Users,
  Wrench,
} from "lucide-react";
import type { AdvancedEntry, NavItem } from "./types";

export const TOP_LEVEL: NavItem[] = [
  { kind: "item", href: "/settings/general", labelKey: "shell.sidebar.items.general", icon: <Settings2 /> },
  {
    kind: "item",
    href: "/settings/members",
    labelKey: "shell.sidebar.items.members",
    icon: <Users />,
    adminOnly: true,
  },
  { kind: "item", href: "/settings/profile", labelKey: "shell.sidebar.items.profile", icon: <User /> },
  { kind: "item", href: "/settings/updates", labelKey: "shell.sidebar.items.updates", icon: <ArrowUpCircle /> },
];

export const MAINTENANCE_BRANCH: AdvancedEntry = {
  kind: "branch",
  href: "/settings/maintenance",
  labelKey: "shell.sidebar.items.maintenance",
  icon: <Wrench />,
  adminOnly: true,
  children: [
    { href: "/settings/maintenance/review", labelKey: "shell.sidebar.items.review", countKey: "review" },
    { href: "/settings/maintenance/duplicates", labelKey: "shell.sidebar.items.duplicates", countKey: "duplicates" },
    { href: "/settings/maintenance/recycle-bin", labelKey: "shell.sidebar.items.recycleBin", countKey: "recycleBin" },
    { href: "/settings/maintenance/quarantine", labelKey: "shell.sidebar.items.quarantine", countKey: "quarantine" },
  ],
};

export const ADVANCED_ITEMS: AdvancedEntry[] = [
  {
    kind: "item",
    href: "/settings/integrations",
    labelKey: "shell.sidebar.items.integrations",
    icon: <Blocks />,
    adminOnly: true,
  },
  {
    kind: "item",
    href: "/settings/engine",
    labelKey: "shell.sidebar.items.engine",
    icon: <ListOrdered />,
    adminOnly: true,
  },
  MAINTENANCE_BRANCH,
  { kind: "item", href: "/settings/jobs", labelKey: "shell.sidebar.items.jobs", icon: <Timer />, adminOnly: true },
  { kind: "item", href: "/settings/logs", labelKey: "shell.sidebar.items.logs", icon: <FileText />, adminOnly: true },
];

export const MAINTENANCE_ICONS = {
  review: <Inbox />,
  duplicates: <CopyCheck />,
  recycleBin: <Trash2 />,
  quarantine: <ShieldBan />,
} as const;

export const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
