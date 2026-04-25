"use client";

import { Check, Moon, Sparkles, Sun, Waves } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@utils/cn";
import { emptyPanel, sectionSubtitle, sectionTitle } from "../../styles";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
  { value: "ocean", label: "Ocean", icon: Waves },
] as const;

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className={sectionTitle()}>Appearance</h2>
        <p className={sectionSubtitle()}>Pick the theme that matches your environment.</p>
      </header>

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
              {active && <Check className="text-primary-500 size-4" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function LanguageRegionPanel() {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className={sectionTitle()}>Language &amp; Region</h2>
        <p className={sectionSubtitle()}>Coming soon.</p>
      </header>
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">Language and region settings will live here.</span>
      </div>
    </section>
  );
}
