"use client";

import { Settings, Settings2, User, Users, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactElement } from "react";

import { cn } from "@utils/cn";
import { SETTINGS_GROUPS, type SettingsGroup, type SettingsSection } from "./types";
import { sidebar, sidebarGroupButton, sidebarGroupLabel, sidebarItem } from "./styles";

interface SettingsSidebarProps {
  section: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}

const ICON_MAP: Record<SettingsGroup["icon"], ReactElement> = {
  settings: <Settings />,
  users: <Users />,
  user: <User />,
  settings2: <Settings2 />,
};

function isSectionInGroup(group: SettingsGroup, section: SettingsSection): boolean {
  if (group.items) return group.items.some((item) => item.id === section);
  return section.startsWith(`${group.id}`);
}

export function SettingsSidebar({ section, onSelect }: SettingsSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    general: true,
    advanced: true,
  }));

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <nav aria-label="Settings sections" className={sidebar()}>
      {SETTINGS_GROUPS.map((group) => {
        const isActiveGroup = isSectionInGroup(group, section);
        const hasItems = Boolean(group.items && group.items.length > 0);
        const isExpanded = hasItems ? (expanded[group.id] ?? false) : false;

        if (!hasItems) {
          const leafId = `${group.id}` as SettingsSection;
          return (
            <button
              key={group.id}
              type="button"
              className={sidebarGroupButton({ active: section === leafId })}
              onClick={() => onSelect(leafId)}
            >
              {ICON_MAP[group.icon]}
              <span className={sidebarGroupLabel()}>{group.label}</span>
            </button>
          );
        }

        return (
          <div key={group.id} className="flex flex-col gap-0.5">
            <button
              type="button"
              className={sidebarGroupButton({ active: isActiveGroup && !isExpanded })}
              onClick={() => toggle(group.id)}
              aria-expanded={isExpanded}
            >
              {ICON_MAP[group.icon]}
              <span className={sidebarGroupLabel()}>{group.label}</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-fg/40"
              >
                <ChevronDown className="size-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="items"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn("flex flex-col gap-0.5 overflow-hidden")}
                >
                  {group.items?.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={sidebarItem({ active: section === item.id })}
                      onClick={() => onSelect(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
