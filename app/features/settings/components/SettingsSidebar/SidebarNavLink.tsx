"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { NotificationBadge } from "@components/ui/NotificationBadge";

import { sidebarGroupButton, sidebarGroupLabel } from "../../styles";
import type { SidebarNavLinkProps } from "./types";

export function SidebarNavLink({ page, active, attention }: SidebarNavLinkProps) {
  const { t } = useTranslation("settings");
  const Icon = page.icon;

  return (
    <Link href={page.href} aria-current={active ? "page" : undefined} className={sidebarGroupButton({ active })}>
      <Icon />
      <span className={sidebarGroupLabel()}>{t(page.labelKey)}</span>
      <NotificationBadge visible={attention} label={t("shell.sidebar.attention")} placement="inline" />
    </Link>
  );
}
