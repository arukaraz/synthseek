"use client";

import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@utils/cn";

import { SettingsCard } from "../../components/SettingsCard";
import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { THEME_OPTIONS } from "./constants";

export function GeneralSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="General" />

      <SettingsCard title="Theme" description="Pick the theme that matches your environment.">
        <div className="flex flex-col gap-1.5">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = mounted && theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "border-fg/10 hover:bg-fg/5 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  active && "border-primary-500/40 bg-primary-500/10"
                )}
                aria-pressed={active}
              >
                <Icon className="text-fg/70 size-4" />
                <span className="text-fg flex-1 text-left text-sm font-medium">{label}</span>
                {active ? <Check className="text-primary-500 size-4" /> : null}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
