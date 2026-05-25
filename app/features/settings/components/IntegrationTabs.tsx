"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { integrationTab, integrationTabUnderline, integrationTabsBar } from "../styles";

interface IntegrationTabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface IntegrationTabsProps {
  items: ReadonlyArray<IntegrationTabItem>;
}

export function IntegrationTabs({ items }: IntegrationTabsProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Integrations" className={integrationTabsBar()}>
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
