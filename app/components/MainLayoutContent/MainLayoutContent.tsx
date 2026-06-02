"use client";

import { ContentShell } from "@components/ContentShell";
import { TopHeader } from "@components/TopHeader";
import { useSubscriptions } from "@hooks/api/subscriptions";
import { useHashTargetGlow } from "@hooks/ui/useHashTargetGlow";
import { useRouter, useSearchParams } from "next/navigation";

import type { MainLayoutContentProps } from "./types";

export function MainLayoutContent({ children }: MainLayoutContentProps) {
  useSubscriptions();
  useHashTargetGlow();

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const currentFilter = searchParams.get("filter");
      const filterParam = currentFilter ? `&filter=${currentFilter}` : "";
      router.push(`/search?q=${encodeURIComponent(query)}${filterParam}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="bg-surface min-h-screen overflow-hidden">
      <TopHeader onSearch={handleSearch} initialQuery={searchQuery} />
      <ContentShell>{children}</ContentShell>
    </div>
  );
}
