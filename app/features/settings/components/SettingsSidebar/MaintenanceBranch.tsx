"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { NotificationBadge } from "@components/ui/NotificationBadge";
import { cn } from "@utils/cn";

import { sidebarItem, sidebarLeaf, sidebarLeafCount } from "../../styles";
import { MAINTENANCE_ICONS } from "./constants";
import type { MaintenanceBranchProps } from "./types";

export function MaintenanceBranch({ branch, counts, pathname }: MaintenanceBranchProps) {
  const { t } = useTranslation("settings");
  const inside = pathname.startsWith(branch.href);
  const waiting = branch.children.some((leaf) => (counts?.[leaf.countKey] ?? 0) > 0);
  const [open, setOpen] = useState(inside);

  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(sidebarItem({ active: inside && pathname === branch.href }), "[&_svg]:size-3.5 [&_svg]:shrink-0")}
      >
        {branch.icon}
        <span className="flex-1 text-left">{t(branch.labelKey)}</span>
        <NotificationBadge visible={waiting} label={t("shell.sidebar.maintenanceWaiting")} placement="inline" />
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="size-3" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="maintenance"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            {branch.children.map((leaf) => {
              const count = counts?.[leaf.countKey];
              return (
                <Link key={leaf.href} href={leaf.href} className={sidebarLeaf({ active: pathname === leaf.href })}>
                  {MAINTENANCE_ICONS[leaf.countKey]}
                  <span className="flex-1 truncate text-left">{t(leaf.labelKey)}</span>
                  {count !== undefined && count > 0 ? <span className={sidebarLeafCount()}>{count}</span> : null}
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
