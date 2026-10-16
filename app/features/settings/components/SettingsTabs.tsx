"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { integrationTab, integrationTabCount, integrationTabUnderline, integrationTabsBar } from "../styles";
import type { SettingsTabsProps } from "./types";

export function SettingsTabs({ items, ariaLabel }: SettingsTabsProps) {
  const pathname = usePathname();
  return (
    <nav aria-label={ariaLabel} className={integrationTabsBar()}>
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
            {item.count !== undefined && item.count > 0 ? (
              <span className={integrationTabCount()}>{item.count}</span>
            ) : null}
            {active ? <motion.span layoutId="settings-tab-underline" className={integrationTabUnderline()} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
