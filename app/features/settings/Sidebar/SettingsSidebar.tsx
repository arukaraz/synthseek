"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText, ListOrdered, Plug, Settings2, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { cn } from "@utils/cn";

import { sidebar, sidebarFooter, sidebarGroupButton, sidebarGroupLabel, sidebarItem } from "../styles";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const TOP_LEVEL: NavItem[] = [
  { href: "/settings/general", label: "General", icon: <Settings2 /> },
  { href: "/settings/members", label: "Members", icon: <Users /> },
  { href: "/settings/profile", label: "Profile", icon: <User /> },
];

const ADVANCED_ITEMS: NavItem[] = [
  { href: "/settings/connections", label: "Connections", icon: <Plug /> },
  { href: "/settings/engine", label: "Engine", icon: <ListOrdered /> },
  { href: "/settings/logs", label: "Logs", icon: <FileText /> },
];

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname();
  const [advancedOpen, setAdvancedOpen] = useState(() => ADVANCED_ITEMS.some((item) => pathname.startsWith(item.href)));

  return (
    <nav aria-label="Settings sections" className={cn(sidebar(), className)}>
      {TOP_LEVEL.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(sidebarGroupButton({ active }), "[&_svg]:size-4 [&_svg]:shrink-0")}
          >
            {item.icon}
            <span className={sidebarGroupLabel()}>{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        aria-expanded={advancedOpen}
        className={cn(
          "text-fg/40 hover:text-fg/60 mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors"
        )}
      >
        <span className="flex-1 text-left">Advanced</span>
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
            {ADVANCED_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(sidebarItem({ active }), "[&_svg]:size-3.5 [&_svg]:shrink-0")}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className={sidebarFooter()}>synthseek v{BUILD_VERSION}</span>
    </nav>
  );
}
