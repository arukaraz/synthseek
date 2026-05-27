"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SettingsSidebar } from "@features/settings/components/SettingsSidebar";
import { contentScroll, layoutRoot } from "@features/settings/styles";
import { cn } from "@utils/cn";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/settings";

  return (
    <div className={layoutRoot()}>
      <SettingsSidebar className={cn(isRoot ? "flex" : "hidden md:flex")} />
      <main className={cn(contentScroll(), isRoot ? "hidden md:flex" : "flex")}>{children}</main>
    </div>
  );
}
