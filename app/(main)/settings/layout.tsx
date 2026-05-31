"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SettingsSidebar, isAdminOnlySettingsPath } from "@features/settings/components/SettingsSidebar";
import { SettingsAccessDenied } from "@features/settings/components/SettingsAccessDenied";
import { contentScroll, layoutRoot } from "@features/settings/styles";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAuthContext();
  const isRoot = pathname === "/settings";
  const blocked = !isLoading && !isAdmin && isAdminOnlySettingsPath(pathname);

  return (
    <div className={layoutRoot()}>
      <SettingsSidebar className={cn(isRoot ? "flex" : "hidden md:flex")} />
      <main className={cn(contentScroll(), isRoot ? "hidden md:flex" : "flex")}>
        {blocked ? <SettingsAccessDenied /> : children}
      </main>
    </div>
  );
}
