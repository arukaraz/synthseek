"use client";

import type { ParseKeys } from "i18next";
import { Disc3, Menu, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import type { PrimaryNavItem } from "./types";

interface PrimaryNavDefinition {
  href: string;
  icon: LucideIcon;
  labelKey: ParseKeys<"components">;
  isActive: (pathname: string) => boolean;
}

const NAV_DEFINITIONS: PrimaryNavDefinition[] = [
  {
    href: "/",
    icon: Sparkles,
    labelKey: "header.discover",
    isActive: (pathname) => pathname === "/" || pathname === "",
  },
  {
    href: "/requests",
    icon: Menu,
    labelKey: "header.requests",
    isActive: (pathname) => pathname.startsWith("/requests"),
  },
  {
    href: "/library",
    icon: Disc3,
    labelKey: "header.library",
    isActive: (pathname) => pathname.startsWith("/library"),
  },
];

export function usePrimaryNav(): PrimaryNavItem[] {
  const { t } = useTranslation("components");
  const pathname = usePathname();

  return NAV_DEFINITIONS.map((definition) => ({
    href: definition.href,
    icon: definition.icon,
    label: t(definition.labelKey),
    isActive: definition.isActive(pathname),
  }));
}
