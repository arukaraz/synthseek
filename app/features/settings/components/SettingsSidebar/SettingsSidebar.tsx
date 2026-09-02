"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { sidebar, sidebarFooter, sidebarGroupButton, sidebarGroupLabel, sidebarItem } from "../../styles";
import { useMaintenanceCounts } from "@hooks/api/queries/useMaintenanceCounts";

import { ADVANCED_ITEMS, BUILD_VERSION, TOP_LEVEL } from "./constants";
import { MaintenanceBranch } from "./MaintenanceBranch";
import type { SettingsSidebarProps } from "./types";

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const { t } = useTranslation("settings");
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const counts = useMaintenanceCounts(isAdmin);

  const topItems = TOP_LEVEL.filter((item) => !item.adminOnly || isAdmin);
  const advancedItems = ADVANCED_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav aria-label={t("shell.sidebar.ariaLabel")} className={cn(sidebar(), className)}>
      {topItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(sidebarGroupButton({ active }), "[&_svg]:size-4 [&_svg]:shrink-0")}
          >
            {item.icon}
            <span className={sidebarGroupLabel()}>{t(item.labelKey)}</span>
          </Link>
        );
      })}

      {advancedItems.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className={cn(
              "text-fg/40 hover:text-fg/60 mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors"
            )}
          >
            <span className="flex-1 text-left">{t("shell.sidebar.advanced")}</span>
            <motion.span animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="size-3.5" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {advancedOpen ? (
              <motion.div
                key="advanced"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-0.5 overflow-hidden"
              >
                {advancedItems.map((entry) => {
                  if (entry.kind === "branch") {
                    return (
                      <MaintenanceBranch key={entry.href} branch={entry} counts={counts.data} pathname={pathname} />
                    );
                  }
                  const active = pathname === entry.href || pathname.startsWith(`${entry.href}/`);
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={cn(sidebarItem({ active }), "[&_svg]:size-3.5 [&_svg]:shrink-0")}
                    >
                      {entry.icon}
                      {t(entry.labelKey)}
                    </Link>
                  );
                })}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}

      <span className={sidebarFooter()}>{t("shell.sidebar.version", { version: BUILD_VERSION })}</span>
    </nav>
  );
}
