"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

import { SETTINGS_ROOT } from "../../constants";
import { isAdminOnlySettingsPath } from "../../helpers";
import { useSettingsShortcuts } from "../../hooks/useSettingsShortcuts";
import { contentScroll, layoutRoot, pageColumn } from "../../styles";
import { SettingsAccessDenied } from "../SettingsAccessDenied";
import { PageSaveBar, SettingsSaveScope } from "../SettingsSaveScope";
import { SEARCH_INPUT_ID, SettingsPalette } from "../SettingsSearch";
import { SettingsSidebar } from "../SettingsSidebar";
import type { SettingsShellProps } from "./types";

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAuthContext();
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isRoot = pathname === SETTINGS_ROOT;
  const blocked = !isLoading && !isAdmin && isAdminOnlySettingsPath(pathname);

  useSettingsShortcuts({
    onPalette: () => setPaletteOpen(true),
    onSearch: () => document.getElementById(SEARCH_INPUT_ID)?.focus(),
  });

  return (
    <SettingsSaveScope>
      <div className={layoutRoot()}>
        <SettingsSidebar className={cn(isRoot ? "flex" : "hidden md:flex")} query={query} onQueryChange={setQuery} />
        <main className={cn(contentScroll(), isRoot ? "hidden md:flex" : "flex")}>
          <div className={pageColumn()}>{blocked ? <SettingsAccessDenied /> : children}</div>
          <PageSaveBar />
        </main>
      </div>
      <SettingsPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </SettingsSaveScope>
  );
}
