"use client";

import { ContentShell } from "@components/ContentShell";
import TopHeader from "@components/TopHeader";
import { UpdateBanner } from "@components/UpdateBanner/UpdateBanner";
import { AuthGuard } from "@features/auth/components/AuthGuard";
import { useSubscriptions, useVersionState } from "@hooks/api/subscriptions";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  useSubscriptions();
  const { updateAvailable, latestVersion, currentVersion } = useVersionState();

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
      {updateAvailable && latestVersion && (
        <UpdateBanner latestVersion={latestVersion} currentVersion={currentVersion} />
      )}
      <TopHeader onSearch={handleSearch} initialQuery={searchQuery} />
      <ContentShell>{children}</ContentShell>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="bg-surface min-h-screen" />}>
        <MainLayoutContent>{children}</MainLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}
