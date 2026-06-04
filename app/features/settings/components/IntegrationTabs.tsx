"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { integrationTab, integrationTabUnderline, integrationTabsBar } from "../styles";
import type { IntegrationTabsProps } from "./types";

export function IntegrationTabs({ items }: IntegrationTabsProps) {
  const { t } = useTranslation("settings");
  const pathname = usePathname();
  return (
    <nav aria-label={t("shell.integrationTabs.ariaLabel")} className={integrationTabsBar()}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-current={active ? "page" : undefined}
            className={integrationTab({ active })}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
            {active ? <motion.span layoutId="integration-tab-underline" className={integrationTabUnderline()} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
